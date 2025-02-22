use miette::Diagnostic;
use once_cell::sync::Lazy;
use thiserror::Error;

use crate::ast::{BExpr, Commands, Flow, SecurityClass};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct SourceSpan {
    /// The start of the span.
    offset: usize,
    /// The total length of the span. Think of this as an offset from `start`.
    length: usize,
}

impl SourceSpan {
    #[must_use]
    pub fn offset(&self) -> usize {
        self.offset
    }
    #[must_use]
    pub fn len(&self) -> usize {
        self.length
    }
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
    #[must_use]
    pub fn join(&self, span: SourceSpan) -> SourceSpan {
        let offset = self.offset.min(span.offset);
        let end = self.end().max(span.end());
        let length = end - offset;
        SourceSpan { offset, length }
    }
    #[must_use]
    pub fn end(&self) -> usize {
        self.offset + self.length
    }
    #[must_use]
    pub fn contains(&self, byte_offset: usize) -> bool {
        self.offset() <= byte_offset && byte_offset < self.end()
    }

    #[must_use]
    pub fn union(
        init: SourceSpan,
        span: impl IntoIterator<Item = Option<SourceSpan>>,
    ) -> SourceSpan {
        span.into_iter()
            .fold(init, |a, b| b.map(|b| a.join(b)).unwrap_or(a))
    }
}

impl From<SourceSpan> for miette::SourceSpan {
    fn from(s: SourceSpan) -> Self {
        Self::new(s.offset.into(), s.length)
    }
}
impl From<(usize, usize)> for SourceSpan {
    fn from((offset, length): (usize, usize)) -> Self {
        SourceSpan { offset, length }
    }
}

pub fn parse_commands(src: &str) -> Result<Commands, ParseError> {
    static PARSER: Lazy<crate::gcl::CommandsParser> = Lazy::new(crate::gcl::CommandsParser::new);

    PARSER.parse(src).map_err(|e| ParseError::new(src, e))
}

pub fn parse_bexpr(src: &str) -> Result<BExpr, ParseError> {
    static PARSER: Lazy<crate::gcl::BExprParser> = Lazy::new(crate::gcl::BExprParser::new);

    PARSER.parse(src).map_err(|e| ParseError::new(src, e))
}

pub fn parse_aexpr(src: &str) -> Result<crate::ast::AExpr, ParseError> {
    static PARSER: Lazy<crate::gcl::AExprParser> = Lazy::new(crate::gcl::AExprParser::new);

    PARSER.parse(src).map_err(|e| ParseError::new(src, e))
}

pub fn parse_action(src: &str) -> Result<crate::pg::Action, ParseError> {
    static PARSER: Lazy<crate::gcl::ActionParser> = Lazy::new(crate::gcl::ActionParser::new);

    PARSER.parse(src).map_err(|e| ParseError::new(src, e))
}

pub fn parse_security_lattice(src: &str) -> Result<Vec<Flow<SecurityClass>>, ParseError> {
    static PARSER: Lazy<crate::gcl::SecurityLatticeParser> =
        Lazy::new(crate::gcl::SecurityLatticeParser::new);

    PARSER.parse(src).map_err(|e| ParseError::new(src, e))
}

#[derive(Debug, Error, Diagnostic, Clone)]
pub enum ParseError {
    #[error("Invalid Token")]
    #[diagnostic()]
    InvalidToken {
        #[source_code]
        src: String,
        #[label("This token is not valid in this context")]
        err_span: SourceSpan,
    },
    #[error("Unrecognized Token")]
    #[diagnostic(help("Expected tokens here are: {expected}{}", if let Some(hint) = hint { format!("\n{hint}") } else { "".to_string() }))]
    UnrecognizedToken {
        #[source_code]
        src: String,
        #[label = "The token \"{token}\" is unrecognized in this context."]
        err_span: SourceSpan,
        token: String,
        expected: String,
        hint: Option<String>,
    },
    #[error("Unrecognized EOF")]
    #[diagnostic(help("Expected tokens in this context are:\n{expected}"))]
    UnrecognizedEof {
        #[source_code]
        src: String,
        #[label = "The document ends too early. Are you missing a token?"]
        err_span: SourceSpan,
        expected: String,
    },
    #[error("Integer is too large")]
    #[diagnostic(help("The integer is too large to be represented"))]
    IntegerTooLarge {
        #[source_code]
        src: String,
        #[label = "The integer is too large to be represented"]
        err_span: SourceSpan,
    },
}
// impl ParseError {
//     pub fn span(&self) -> Span {
//         match self {
//             ParseError::InvalidToken { err_span, .. }
//             | ParseError::UnrecognizedToken { err_span, .. }
//             | ParseError::UnrecognizedEof { err_span, .. } => Span {
//                 start: err_span.offset(),
//                 end: err_span.offset() + err_span.len(),
//             },
//         }
//     }
// }

pub(crate) enum CustomError {
    IntegerTooLarge { from: usize, to: usize },
}

impl ParseError {
    pub(crate) fn new(
        src: &str,
        e: lalrpop_util::ParseError<usize, lalrpop_util::lexer::Token, CustomError>,
    ) -> Self {
        let prep_src = || format!("{src}\n");

        match e {
            lalrpop_util::ParseError::InvalidToken { location } => ParseError::InvalidToken {
                src: prep_src(),
                err_span: (location, 0).into(),
            },
            lalrpop_util::ParseError::UnrecognizedEof { location, expected } => {
                ParseError::UnrecognizedEof {
                    src: prep_src(),
                    err_span: (location, 0).into(),
                    expected: expected.join(", "),
                }
            }
            lalrpop_util::ParseError::UnrecognizedToken { token, expected } => {
                ParseError::UnrecognizedToken {
                    src: prep_src(),
                    err_span: (token.0, token.2 - token.0).into(),
                    token: token.1.to_string(),
                    expected: expected.join(", "),
                    hint: None,
                }
            }
            lalrpop_util::ParseError::ExtraToken { .. } => todo!(),
            lalrpop_util::ParseError::User { error } => match error {
                CustomError::IntegerTooLarge { from, to } => ParseError::IntegerTooLarge {
                    src: prep_src(),
                    err_span: (from, to).into(),
                },
            },
        }
    }
}
