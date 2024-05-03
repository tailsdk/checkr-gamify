use std::sync::Arc;

use crate::Analysis;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Input {
    pub(crate) analysis: Analysis,
    pub(crate) json: Arc<serde_json::Value>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Output {
    pub(crate) analysis: Analysis,
    pub(crate) json: Arc<serde_json::Value>,
}

impl Input {
    pub fn analysis(&self) -> Analysis {
        self.analysis
    }
}

impl Output {
    pub fn analysis(&self) -> Analysis {
        self.analysis
    }
}

impl std::fmt::Display for Input {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.json.fmt(f)
    }
}
impl std::fmt::Display for Output {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.json.fmt(f)
    }
}
