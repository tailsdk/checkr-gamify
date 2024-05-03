use std::{
    ffi::OsStr,
    fmt::Debug,
    process::Stdio,
    sync::{Arc, RwLock},
};

use tokio::{io::AsyncReadExt, sync::Mutex, task::JoinSet};
use tracing::Instrument;

use crate::{
    job::{Job, JobEvent, JobEventSource, JobInner, JobKind},
    JobId,
};

#[derive(Debug, Default, Clone)]
pub struct Hub<T> {
    jobs: Arc<RwLock<Vec<Job<T>>>>,
}

impl<T> PartialEq for Hub<T> {
    fn eq(&self, other: &Self) -> bool {
        Arc::ptr_eq(&self.jobs, &other.jobs)
    }
}

impl<T: Send + Sync + 'static> Hub<T> {
    #[tracing::instrument(skip_all, fields(?kind))]
    pub fn exec_command(
        &self,
        kind: JobKind,
        data: T,
        program: impl AsRef<OsStr> + Debug,
        args: impl IntoIterator<Item = impl AsRef<OsStr>> + Debug,
    ) -> Job<T>
    where
        T: Debug,
    {
        let id = JobId {
            value: self.jobs.read().unwrap().len(),
        };

        let mut cmd = tokio::process::Command::new(program);

        cmd.args(args)
            .stderr(Stdio::piped())
            .stdin(Stdio::piped())
            .stdout(Stdio::piped());

        cmd.kill_on_drop(true);

        cmd.env("CARGO_TERM_COLOR", "always");

        tracing::debug!(?cmd, "spawning");

        let mut child = cmd.spawn().unwrap();

        let stdin = child.stdin.take().expect("we piped stdin");
        let stderr = child.stderr.take().expect("we piped stderr");
        let stdout = child.stdout.take().expect("we piped stdout");

        let (events_tx, events_rx) = tokio::sync::broadcast::channel(128);

        let mut join_set = tokio::task::JoinSet::new();
        let stderr = spawn_reader(
            JobEventSource::Stderr,
            &mut join_set,
            stderr,
            events_tx.clone(),
        );
        let stdout = spawn_reader(
            JobEventSource::Stdout,
            &mut join_set,
            stdout,
            events_tx.clone(),
        );

        let job = Job::new(
            id,
            JobInner {
                id,
                child: tokio::sync::RwLock::new(Some(child)),
                stdin: Some(stdin),
                events_rx,
                join_set: Mutex::new(join_set),
                stderr,
                stdout,
                combined: Default::default(),
                kind,
                state: Default::default(),
                data,
            },
        );

        self.jobs.write().unwrap().push(job.clone());

        job
    }
    pub fn jobs(&self) -> Vec<Job<T>> {
        self.jobs.read().unwrap().clone()
    }

    pub fn get_job(&self, id: JobId) -> Option<Job<T>> {
        self.jobs().iter().find(|j| j.id() == id).cloned()
    }
}

#[tracing::instrument(skip_all, fields(spawn_reader=%src))]
fn spawn_reader(
    src: JobEventSource,
    join_set: &mut JoinSet<()>,
    mut reader: impl AsyncReadExt + Sized + Unpin + Send + 'static,
    event_tx: tokio::sync::broadcast::Sender<JobEvent>,
) -> Arc<RwLock<Vec<u8>>> {
    let output = Arc::<RwLock<Vec<u8>>>::default();
    join_set.spawn({
        let output = Arc::clone(&output);
        async move {
            let mut buf = Vec::with_capacity(1024);
            loop {
                buf.clear();
                let read_n = reader.read_buf(&mut buf).await.expect("read failed");
                if read_n == 0 {
                    tracing::debug!("closed");
                    event_tx.send(JobEvent::Closed { src }).unwrap();
                    break;
                }
                let (from, to) = {
                    let mut output = output.write().unwrap();
                    let from = output.len();
                    output.extend_from_slice(&buf);
                    let to = output.len();
                    (from, to)
                };
                event_tx.send(JobEvent::Wrote { src, from, to }).unwrap();
            }
        }
        .in_current_span()
    });
    output
}
