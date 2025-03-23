<script lang="ts">
  import { writable } from 'svelte/store';
  import { browser } from '$app/environment';
  import Editor from '$lib/components/Editor.svelte';
  import type { MarkerData, MarkerSeverity, ParseResult } from 'chip-wasm';
  import Nav from '$lib/components/Nav.svelte';
  import * as Generator from '$lib/generator';

  let program_answer:[string, string, string, number] = ["","","", -1];
  let hide_answer = false;
  function getProgram(){
      program_answer = Generator.generateTemplate(selected_option, selected_option2);
      if (program_answer[3] == 0) { 
        program = program_answer[2];
        program += program_answer[0];
        if (!hide_answer) {
          program += program_answer[1];
        }
        else {
          program += "// Write the strongest postcondition below \n{ }";
        }
      } else if (program_answer[3] == 1) { 
        if (!hide_answer) {
          program = program_answer[2];
        }
        else {
          program = "// Write the weakest precondition below \n{ }\n";
        }
        program += program_answer[0];
        program += program_answer[1];
      }
      return;
  }

  function changeHide(){
    if (program_answer[3] == 0) {
      if (hide_answer) {
        program = program_answer[2];
        program += program_answer[0];
        program += "// Write the strongest post condition below \n{ }";
      }
      else {
        program += "\n" + program_answer[1];
      }
    } else if (program_answer[3] == 1) {
      if (hide_answer) {
        program = "// Write the weakest precondition below \n{ }\n";
        program += program_answer[0];
        program += program_answer[1];
      }
      else {
        program = program_answer[2] + program;
      }
    }
    return;
  }

  let program = `{ true }
if
  false -> skip
fi
{ true }`;

  let result = writable<ParseResult>({
    parse_error: false,
    prelude: '',
    assertions: [],
    markers: [],
    is_fully_annotated: false,
  });
  let verifications = writable<MarkerData[]>([]);

  let parseError = writable(false);

  let selected_option = 'Completely Random';
	let options = [
		'Completely Random',
		'Skip',
		'Assign',
    'If Statement',
    'Loop',
    'Multiple If Statements',
	];
  let selected_option2 = 'Simple Inequality';
	let options2 = [
		'Simple Inequality',
		'Complex Inequality',
	];

  const STATES = ['idle', 'verifying', 'verified', 'error'] as const;
  type State = (typeof STATES)[number];
  let state = writable<State>('idle');

  $: if (browser) {
    const run = async () => {
      parseError.set(false);
      const { default: init, parse } = await import('chip-wasm');
      await init();
      let res: ParseResult;
      if (hide_answer){
        res = parse(program_answer[2] + program + program_answer[1]);
      }
      else{
        res = parse(program);
      }
      if (res.parse_error) parseError.set(true);
      result.set(res);
    };
    run().catch(console.error);
  }
  let runId = 0;
  $: if (browser) {
    const run = async () => {
      const thisRun = ++runId;
      const z3 = await import('$lib/z3');
      verifications.set([]);
      state.set('verifying');
      let errors = false;
      for (const t of $result.assertions) {
        const res = await z3.run(t.smt, { prelude: $result.prelude });
        const valid = res[res.length - 1].trim() === 'unsat';

        if (thisRun !== runId) {
          console.log('aborted', thisRun, runId, result, res);
          return;
        }

        if (!valid) {
          errors = true;
          verifications.update((res) => [
            ...res,
            {
              severity: 'Error',
              tags: [],
              message: t.text ? t.text : 'Verification failed',
              span: t.span,
              relatedInformation: [],
            },
            ...(t.related
              ? [
                  {
                    severity: 'Info' as MarkerSeverity,
                    tags: [],
                    message: t.related[0],
                    span: t.related[1],
                    relatedInformation: [],
                  },
                ]
              : []),
          ]);
        }
      }
      if (errors) {
        state.set('error');
      } else {
        state.set('verified');
      }
    };
    run().catch(console.error);
  }
</script>

<svelte:head>
  <title>Chip</title>
  <meta name="description" content="Chip" />
</svelte:head>

<Nav title="Chip" />

<div class="relative grid grid-rows-[2fr_auto_auto] overflow-hidden bg-slate-800">
  <Editor bind:value={program} markers={[...$result.markers, ...$verifications]} />
  <div class="items-center p-2 text-2xl text-white">
    <div class="items-center text-left p-5 text-2xl text-white" style="float:left">
      <a class="bg-green-600 hover:bg-green-400 text-white font-semibold py-2 px-4 border border-gray-400 rounded shadow text-left" href="https://forms.gle/76YNJLrSbsEFte8N8">Click here to answer the survey</a>
    </div>
    <div class="items-center text-right p-2 text-2xl text-white" style="float:right">
      <label>
        <input type="checkbox" bind:checked={hide_answer} on:change={ e => changeHide()}/>
        Hide answer
      </label>
      <select bind:value={selected_option2} class="bg-slate-900 hover:bg-slate-600 text-white font-semibold py-2 px-4 border border-gray-400 rounded shadow">
        {#each options2 as value}<option {value}>{value}</option>{/each}
      </select>
      <select bind:value={selected_option} class="bg-slate-900 hover:bg-slate-600 text-white font-semibold py-2 px-4 border border-gray-400 rounded shadow">
        {#each options as value}<option {value}>{value}</option>{/each}
      </select>
      <button class="bg-slate-900 hover:bg-slate-600 text-white font-semibold py-2 px-4 border border-gray-400 rounded shadow" on:click={ e => getProgram() }>Generate</button>
    </div>
  </div>
  <div
    class="flex items-center p-2 text-2xl text-white transition duration-500 {$parseError
      ? 'bg-purple-600'
      : {
          idle: 'bg-gray-500',
          verifying: 'bg-yellow-500',
          verified: 'bg-green-500',
          error: 'bg-red-500',
        }[$state]}"
  >
    <span class="font-bold">
      {$parseError
        ? 'Parse error'
        : {
            idle: 'Idle',
            verifying: 'Verifying...',
            verified: 'Verified',
            error: 'Verification error',
          }[$state]}
    </span>
    <div class="flex-1" />
    <span class="text-xl">
      {#if !$parseError && $state == 'verified'}
        {#if $result.is_fully_annotated}
          The program is <b>fully annotated</b>
        {:else}
          The program is <b><i>not</i> fully annotated</b>
        {/if}
      {/if}
    </span>
  </div>
  <!-- <div>
		{#each result.assertions as triple}
			<pre class="p-4">{triple.smt}</pre>
		{/each}
	</div> -->
</div>
