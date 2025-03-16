let randomValue = 20;
let randomLength = 5;
//Errors that should not be happening
//{ a = 9 & b = -6 }
//if
//a < 8 -> b := b + 9
//fi
//{ a = 9 & b = 3 }

//why weakest precondition does not work
//{ a = 3 & b >= -6 }
//if
//b = -1 -> b := b + -8
//fi
//{ a = 3 & b >= -6 }

type Program = {
    type: string;
    variant: number;
    program: (Skip|Assign|If|Do|Guard)[];
    program_template: number[];
    start: number[][];
    end: number[][];
    variable: string[];
    variable_inequality: number[];
    starting_variable_inequality: number[];
    start_variables: number;
    length: number;
    bool: boolean[];
}

type Skip = {
    type: string;
}

type Assign = {
    type: string;
    variant: number;
    index: number;
    assign: number;
    variable: string[];
    end: number[][];
    start: number[][];
}

type If = {
    type: string;
    variant: number;
    index: number;
    program: (Skip|Assign|If|Do)[];
    value: number;
    bool: boolean[];
    end: number[][];
    start: number[][];
    variable: string[];
    variable_inequality: number[];
    guard_bool: boolean[];
}

type Do = {
    type: string;
    value: number;
    value2: number;
    index: number;
    index2: number;
    variable: string[];
    variable_inequality: number[];
    program: (Skip|Assign|If|Do)[];
    before: number[][];
    end: number[][];
    start: number[][];
    bool: boolean[];
    change2: number;
    variant: number;
    variant2: number;
    multiplier: number;
}

type Guard = {
    type: string;
    length: number;
    program: (If)[];
    start: number[][];
    end: number[][];
    new_end: number[][];
    before: number[][];
    bool: boolean[];
    variable: string[];
    variable_inequality: number[];
}

export function generateTemplate(selected:string, selected2:string): [string, string, string]{
    let inequality:number = 1;
    switch (selected2) {
        case "Simple Inequality":
            inequality = 1;
            break;
        case "Complex Inequality":
            inequality = 5;
            break;
        default:   
            break;
    }
    switch (selected) {
        case "Completely Random":
            let template:number[] = [];
            for (let i = 0; i < getRandomInt(randomLength)+1; i++) {
                template.push(getRandomInt(5));
            }
            return generateProgramPost(inequality, template.length, template);
        case "Skip":
            return generateProgramPost(inequality, 1, [0]);
        case "Assign":
            return generateProgramPost(inequality, 1, [1]);
        case "If Statement":
            return generateProgramPost(inequality, 1, [2]);   
        case "Loop":
            return generateProgramPost(inequality, 1, [3]);
        case "Multiple If Statements":
            return generateProgramPost(inequality, 1, [4]);    
    
        default:   
            break;
    }
    return ["","", ""];
}

function generateProgramPost(inequality:number, length:number, predefinedProgram:number[]): [string, string, string] {
    let program_obj: Program = {
        type: "program",
        variant: 0,
        program: [],
        program_template: predefinedProgram,
        start: [],
        end: [],
        variable: [],
        variable_inequality: [],
        starting_variable_inequality: [],
        length: length,
        bool: [true],
        start_variables: getRandomInt(2),
    };
    for (let i = 0; i <= program_obj.start_variables; i++) {
        program_obj.variable.push(String.fromCharCode(97+i));
        program_obj.starting_variable_inequality.push(getRandomInt(inequality));
        program_obj.start.push([getRandomInt(randomValue)-10]);
        program_obj.variable_inequality.push(program_obj.starting_variable_inequality[i]);
        program_obj.end.push(program_obj.start[i])
    }

    for (let i = 0; i < program_obj.program_template.length; i++) {
        switch (program_obj.program_template[i]) {
            case 0:
                program_obj.program.push(generateSkip());
                break;
            case 1:
                program_obj.program.push(generateAssignPost(program_obj));
                break;
            case 2:
                program_obj.program.push(generateIfPost(program_obj));
                break;
            case 3:
                program_obj.program.push(generateDoPost(program_obj));
                break;
            case 4:
                program_obj.program.push(generateGuardPost(program_obj));
                break;
        
            default:
                break;
        }
        
    }
    let max:number = 0;
    for (let i = 0; i < program_obj.end.length; i++) {
        if (program_obj.variable_inequality[i] == 1 || program_obj.variable_inequality[i] == 2){
            max = -1024;
                for (let j = 0; j < program_obj.end[i].length; j++) {
                    if(program_obj.end[i][j] > max){
                        max = program_obj.end[i][j];
                    }
                }
                program_obj.end[i] = [max];
        }
        else if (program_obj.variable_inequality[i] == 3 || program_obj.variable_inequality[i] == 4){
            max = 1024;
                for (let j = 0; j < program_obj.end[i].length; j++) {
                    if(program_obj.end[i][j] < max){
                        max = program_obj.end[i][j];
                    }
                }
                program_obj.end[i] = [max];
        }
    }
    console.log(program_obj);
    return assembleProgram(program_obj);
}

function generateSkip(){
    let skip: Skip = {
        type: "skip"
    }
    return skip;
} 

function generateAssignPost(program_obj:Program | If | Do, index:number = getRandomInt(program_obj.variable.length), multiplier:number = 1, variant:number = getRandomInt(3), assign:number = getRandomInt(randomValue)-10): Assign{
    let assign_obj: Assign = {
        type: "assign",
        variant: variant,
        index: index,
        assign: assign,
        variable: program_obj.variable,
        end: [...program_obj.end],
        start: [...program_obj.start],
    }
    assign_obj.end[assign_obj.index] = [];
    for (let j = 0; j < program_obj.bool.length; j++) {
        if(program_obj.bool[j]){
            switch (assign_obj.variant) {
                case 0:
                    assign_obj.end[assign_obj.index].push(assign_obj.assign);
                    program_obj.variable_inequality[assign_obj.index] = 0;
                    break;
                case 1:
                    for (let i = 0; i < program_obj.end[assign_obj.index].length; i++) {
                        assign_obj.end[assign_obj.index].push(program_obj.end[assign_obj.index][i] + assign_obj.assign * multiplier);
                    }
                    break;
                case 2:
                    for (let i = 0; i < program_obj.end[assign_obj.index].length; i++) {
                        assign_obj.end[assign_obj.index].push(program_obj.end[assign_obj.index][i] - assign_obj.assign * multiplier);
                    }
                    break;
                default:
                    break;
            }
        }
        else {
            for (let i = 0; i < program_obj.end[assign_obj.index].length; i++) {
                assign_obj.end[assign_obj.index].push(program_obj.end[assign_obj.index][i]);
            }
        }
    }
    assign_obj.end[assign_obj.index] = [ ...new Set(assign_obj.end[assign_obj.index])]
    program_obj.end[assign_obj.index] = assign_obj.end[assign_obj.index];
    return assign_obj;
}

function generateIfPost(program_obj: (Program | Guard), isGuard:boolean = false): If{
    var if_obj: If = {
        type: "if",
        variant: getRandomInt(7),
        index: getRandomInt(program_obj.variable.length),
        program: [],
        value: getRandomInt(randomValue)-10,
        bool: [],
        guard_bool: [],
        end: [...program_obj.end],
        start: [...program_obj.start],
        variable: program_obj.variable,
        variable_inequality: [],
    }
    if_obj.variable_inequality = [...program_obj.variable_inequality];
    console.log(program_obj.end[if_obj.index].length);
    console.log(if_obj.variant);
    console.log(if_obj.variable_inequality[if_obj.index]);
    console.log("done");
    switch (if_obj.variant) {
        case 0:
            if_obj.bool = [true];
            break;
        case 1:
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] == if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if_obj.bool.push((-10000 > if_obj.value));
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if_obj.bool.push((-10000 >= if_obj.value));
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] < if_obj.value));
                        if_obj.bool.push((10000 < if_obj.value));
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if_obj.bool.push((10000 <= if_obj.value));
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 2:
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if_obj.bool.push((-10000 > if_obj.value));
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if_obj.bool.push((-10000 > if_obj.value));
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if_obj.bool.push((10000 > if_obj.value));
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if_obj.bool.push((10000 > if_obj.value));
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 3:
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if_obj.bool.push((-10000 >= if_obj.value));
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if_obj.bool.push((-10000 >= if_obj.value));
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if_obj.bool.push((10000 >= if_obj.value));
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if_obj.bool.push((10000 >= if_obj.value));
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 4:
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] < if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if_obj.bool.push((-10000 <= if_obj.value));
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] < if_obj.value));
                        if_obj.bool.push((-10000 < if_obj.value));
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] < if_obj.value));
                        if_obj.bool.push((10000 < if_obj.value));
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] < if_obj.value));
                        if_obj.bool.push((10000 < if_obj.value));
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 5:
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if_obj.bool.push((-10000 <= if_obj.value));
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if_obj.bool.push((-10000 <= if_obj.value));
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if_obj.bool.push((10000 <= if_obj.value));
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if_obj.bool.push((10000 <= if_obj.value));
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 6:
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push(!(program_obj.end[if_obj.index][i] == if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push(!(program_obj.end[if_obj.index][i] > if_obj.value));
                        if_obj.bool.push(!(-10000 > if_obj.value));
                        break;
                    case 2:
                        if_obj.bool.push(!(program_obj.end[if_obj.index][i] >= if_obj.value));
                        if_obj.bool.push(!(-10000 >= if_obj.value));
                        break;
                    case 3:
                        if_obj.bool.push(!(program_obj.end[if_obj.index][i] < if_obj.value));
                        if_obj.bool.push(!(10000 < if_obj.value));
                        break;
                    case 4:
                        if_obj.bool.push(!(program_obj.end[if_obj.index][i] <= if_obj.value));
                        if_obj.bool.push(!(10000 <= if_obj.value));
                        break;
                
                    default:
                        break;
                }
            }
            break;
    
        default:
            break;
    }
    console.log([...if_obj.bool]);
    if (isGuard){
        if_obj.guard_bool = [...if_obj.bool];
        for (let i = 0; i < if_obj.bool.length; i++) {
            if (if_obj.bool[i]){
                if_obj.bool = [true];
            }
        }
    }
    switch (getRandomInt(2)) {
        case 0:
            if_obj.program.push(generateSkip());
            break;
        case 1:
            if (isGuard){ 
                if_obj.program.push(generateAssignPost(if_obj, getRandomInt(program_obj.variable.length), 1, getRandomInt(2)+1));
            }
            else{
                if_obj.program.push(generateAssignPost(if_obj));
            }
            break;
    
        default:
            break;
    }
    program_obj.end = if_obj.end;
    program_obj.variable_inequality = [...if_obj.variable_inequality]
    return if_obj;
}

function generateDoPost(program_obj:Program): Do{
    var do_obj: Do = {
        type: "do",
        value:  getRandomInt(20)-10,
        value2:  getRandomInt(20)-10,
        index2: getRandomInt(program_obj.variable.length),
        index: program_obj.variable.length,
        variable: [],
        variable_inequality: [],
        program: [],
        before: [],
        end: [],
        start: [],
        bool: [],
        change2: getRandomInt(20)-10,
        variant: 0,
        variant2: getRandomInt(2)+1,
        multiplier: 1,
    };
    program_obj.variable.push(String.fromCharCode(97+program_obj.variable.length));
    do_obj.variable = program_obj.variable;
    program_obj.variable_inequality.push(0);
    program_obj.starting_variable_inequality.push(0);
    do_obj.variable_inequality = [...program_obj.variable_inequality];
    program_obj.start.push([do_obj.value2]);
    program_obj.end.push([do_obj.value2]);
    do_obj.before = [...program_obj.end];
    do_obj.end = program_obj.end;
    do_obj.start = program_obj.start;
    if(do_obj.value < program_obj.end[do_obj.index][0]){
        do_obj.variant = 1;

    } else {
        do_obj.variant = 0;
        if (do_obj.value == 0){
            do_obj.value += 1;
        }
    }
    do_obj.bool.push(true);
    if(do_obj.variant == 0){
        do_obj.multiplier = (do_obj.value - program_obj.end[do_obj.index][0]);

    } else if (do_obj.variant == 1) {
        do_obj.multiplier = program_obj.end[do_obj.index][0] - do_obj.value;
    }
    switch (do_obj.variant) {
        case 0:
            do_obj.program.push(generateAssignPost(do_obj, do_obj.index, do_obj.multiplier, 1, 1));
            break;
    
        default:
            do_obj.program.push(generateAssignPost(do_obj, do_obj.index, do_obj.multiplier, 2, 1));
            break;
    }
    do_obj.program.push(generateAssignPost(do_obj, do_obj.index2, do_obj.multiplier, do_obj.variant2, do_obj.change2));
    do_obj.end[do_obj.index] = [do_obj.value];
    program_obj.end = do_obj.end;
    return do_obj;
}

function generateGuardPost(program_obj:Program): Guard{
    var guard_obj: Guard = {
        type: "guard",
        length: getRandomInt(2)+2,
        program: [],
        end: [...program_obj.end],
        new_end: [],
        start: [],
        before: [...program_obj.end],
        bool: [],
        variable: [...program_obj.variable],
        variable_inequality: [...program_obj.variable_inequality],
    }
    let bool:boolean = false;
    let true_counter:number = 0;
    for (let i = 0; i < program_obj.end.length; i++) {
        guard_obj.new_end.push([]);
        
    }
    guard_obj.before = [...program_obj.end]
    for (let i = 0; i < guard_obj.length; i++) {
        guard_obj.end = [...guard_obj.before];
        guard_obj.program.push(generateIfPost(guard_obj, true));
        for (let j = 0; j < guard_obj.end.length; j++) {
            for (let k = 0; k < program_obj.end[j].length; k++) {
                if (guard_obj.program[i].bool[0]){
                    for (let u = 0; u < guard_obj.program[i].guard_bool.length; u++) {
                        if(guard_obj.program[i].guard_bool[u]){
                            true_counter += 1;
                        }
                        else{
                            true_counter -= 1000;
                        }
                    }
                    bool = true;
                    guard_obj.new_end[j].push(guard_obj.end[j][k]);
                }
            }
            
        }
        for (let u = 0; u < guard_obj.program[i].guard_bool.length; u++) {
            guard_obj.bool.push(guard_obj.program[i].guard_bool[u]);
            
        }
    }
    if(true_counter == 0){
        for (let i = 0; i < guard_obj.before.length; i++) {
            for (let j = 0; j < guard_obj.before[i].length; j++) {
                guard_obj.new_end[i].push(guard_obj.before[i][j]);
            }
            
        }
    }
    for (let i = 0; i < guard_obj.new_end.length; i++) {
        guard_obj.new_end[i] = [ ...new Set(guard_obj.new_end[i])];
        
    }
    if (bool){
        program_obj.end = guard_obj.new_end;
        program_obj.variable_inequality = guard_obj.variable_inequality;
    }
    return guard_obj;

}
/*
function generateProgramPre(inequality:number, length:number, predefinedProgram:number[]): [string, string, string] {
    let program_obj: Program = {
        type: "program",
        variant: 1,
        program: [],
        program_template: predefinedProgram,
        start: [],
        end: [],
        variable: [],
        variable_inequality: [],
        length: length,
        bool: [true],
        start_variables: getRandomInt(2),
    };
    for (let i = 0; i <= program_obj.start_variables; i++) {
        program_obj.variable.push(String.fromCharCode(97+i));
        program_obj.variable_inequality.push(getRandomInt(inequality));
        program_obj.start.push([getRandomInt(randomValue)-10]);
        program_obj.end.push(program_obj.start[i])
    }

    for (let i = 0; i < program_obj.program_template.length; i++) {
        switch (program_obj.program_template[i]) {
            case 0:
                program_obj.program.push(generateSkip());
                break;
            case 1:
                program_obj.program.push(generateAssignPre(program_obj));
                break;
            case 2:
                program_obj.program.push(generateIfPre(program_obj));
                break;
            case 3:
                program_obj.program.push(generateDoPre(program_obj));
                break;
            case 4:
                program_obj.program.push(generateGuardPre(program_obj));
                break;
        
            default:
                break;
        }
        
    }
    let max:number = 0;
    for (let i = 0; i < program_obj.start.length; i++) {
        if (program_obj.variable_inequality[i] == 1 || program_obj.variable_inequality[i] == 2){
            max = -1024;
                for (let j = 0; j < program_obj.start[i].length; j++) {
                    if(program_obj.start[i][j] > max){
                        max = program_obj.start[i][j];
                    }
                }
                program_obj.start[i] = [max];
        }
        else if (program_obj.variable_inequality[i] == 3 || program_obj.variable_inequality[i] == 4){
            max = 1024;
                for (let j = 0; j < program_obj.start[i].length; j++) {
                    if(program_obj.start[i][j] < max){
                        max = program_obj.start[i][j];
                    }
                }
                program_obj.start[i] = [max];
        }
    }
    console.log(program_obj);
    return assembleProgram(program_obj);
}

function generateAssignPre(program_obj:Program | If | Do, index:number = getRandomInt(program_obj.variable.length), multiplier:number = 1, variant:number = getRandomInt(2)+1, assign:number = getRandomInt(randomValue)-10): Assign{
    let assign_obj: Assign = {
        type: "assign",
        variant: variant,
        index: index,
        assign: assign,
        variable: program_obj.variable,
        end: [...program_obj.end],
        start: [...program_obj.end],
    }
    assign_obj.start[assign_obj.index] = [];
    for (let j = 0; j < program_obj.bool.length; j++) {
        if(program_obj.bool[j]){
            switch (assign_obj.variant) {
                case 1:
                    for (let i = 0; i < program_obj.end[assign_obj.index].length; i++) {
                        assign_obj.start[assign_obj.index].push(program_obj.end[assign_obj.index][i] - assign_obj.assign * multiplier);
                    }
                    break;
                case 2:
                    for (let i = 0; i < program_obj.end[assign_obj.index].length; i++) {
                        assign_obj.start[assign_obj.index].push(program_obj.end[assign_obj.index][i] + assign_obj.assign * multiplier);
                    }
                    break;
                default:
                    break;
            }
        }
        else {
            for (let i = 0; i < program_obj.end[assign_obj.index].length; i++) {
                assign_obj.start[assign_obj.index].push(program_obj.end[assign_obj.index][i]);
            }
        }
    }
    assign_obj.start[assign_obj.index] = [ ...new Set(assign_obj.start[assign_obj.index])]
    program_obj.start[assign_obj.index] = assign_obj.start[assign_obj.index];
    return assign_obj;
}

function generateIfPre(program_obj: Program, isGuard:boolean = false): If{
    var if_obj: If = {
        type: "if",
        variant: getRandomInt(7),
        index: getRandomInt(program_obj.variable.length),
        program: [],
        value: getRandomInt(randomValue)-10,
        bool: [true],
        end: [...program_obj.end],
        start: [...program_obj.end],
        variable: program_obj.variable,
        variable_inequality: program_obj.variable_inequality,
    }
    if_obj.variant = 1;
    console.log(program_obj.end[if_obj.index].length);
    console.log(if_obj.variant);
    console.log(program_obj.variable_inequality[if_obj.index]);
    console.log("done");
    switch (getRandomInt(1)+1) {
        case 0:
            if_obj.program.push(generateSkip());
            break;
        case 1:
            if_obj.program.push(generateAssignPre(if_obj));
            break;
    
        default:
            break;
    }
    if_obj.bool = [];
    switch (if_obj.variant) {
        case 0:
            if_obj.bool = [true];
            break;
        case 1:
            for (let i = 0; i < if_obj.start[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] == if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] > if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] >= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] < if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] <= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 2:
            for (let i = 0; i < if_obj.start[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] > if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] > if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] > if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] > if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] > if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 3:
            for (let i = 0; i < if_obj.start[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] >= if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] >= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] >= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] >= if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] >= if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 4:
            for (let i = 0; i < if_obj.start[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] < if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] < if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] < if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] < if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] < if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 5:
            for (let i = 0; i < if_obj.start[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] <= if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] <= if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] <= if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] <= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((if_obj.start[if_obj.index][i] <= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                
                    default:
                        break;
                }
            }
            break;
        case 6:
            for (let i = 0; i < if_obj.start[if_obj.index].length; i++) {
                switch (if_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push(!(if_obj.start[if_obj.index][i] == if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push(true);
                        if((if_obj.start[if_obj.index][i] > if_obj.value)){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push(true);
                        if((if_obj.start[if_obj.index][i] >= if_obj.value)){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 3:
                        if_obj.bool.push(true);
                        if((if_obj.start[if_obj.index][i] < if_obj.value)){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 4:
                        if_obj.bool.push(true);
                        if((if_obj.start[if_obj.index][i] <= if_obj.value)){
                            if_obj.bool.push(false);
                        }
                        break;
                
                    default:
                        break;
                }
            }
            break;
    
        default:
            break;
    }
    if (isGuard){
        for (let i = 0; i < if_obj.bool.length; i++) {
            if (if_obj.bool[i]){
                if_obj.bool = [true];
            }
        }
    }
    let start:number[][] = [];
    for (let i = 0; i < program_obj.end.length; i++) {
        start.push([]);
        
    }
    for (let i = 0; i < if_obj.bool.length; i++) {
        if (if_obj.bool[i]) {
            for (let i = 0; i < if_obj.start.length; i++) {
                for (let j = 0; j < if_obj.start[i].length; j++) {
                    start[i].push(if_obj.start[i][j]);
                }
                
            }
        }   
        else {
            for (let i = 0; i < program_obj.end.length; i++) {
                for (let j = 0; j < program_obj.end[i].length; j++) {
                    start[i].push(program_obj.end[i][j]);
                }
                
            }
        }  
    }
    console.log(start);
    for (let i = 0; i < start.length; i++) {
        start[i] = [ ...new Set(start[i])];
        
    }
    program_obj.start = start;
    return if_obj;
}

function generateDoPre(program_obj:Program): Do{
    var do_obj: Do = {
        type: "do",
        value:  getRandomInt(20)-10,
        value2:  getRandomInt(20)-10,
        index2: getRandomInt(program_obj.variable.length),
        index: program_obj.variable.length,
        variable: [],
        variable_inequality: [],
        program: [],
        before: [],
        end: [],
        start: [],
        bool: [],
        change2: getRandomInt(20)-10,
        variant: 0,
        variant2: getRandomInt(2)+1,
        multiplier: 1,
    };
    program_obj.variable.push(String.fromCharCode(97+program_obj.variable.length));
    do_obj.variable = program_obj.variable;
    program_obj.variable_inequality[do_obj.index] = 0;
    do_obj.variable_inequality = program_obj.variable_inequality;
    program_obj.start.push([do_obj.value2]);
    program_obj.end.push([do_obj.value2]);
    do_obj.before = [...program_obj.end];
    do_obj.end = program_obj.end;
    do_obj.start = program_obj.start;
    if(do_obj.value < program_obj.end[do_obj.index][0]){
        do_obj.variant = 1;

    } else {
        do_obj.variant = 0;
        if (do_obj.value == 0){
            do_obj.value += 1;
        }
    }
    do_obj.bool.push(true);
    if(do_obj.variant == 0){
        do_obj.multiplier = (do_obj.value - program_obj.end[do_obj.index][0]);

    } else if (do_obj.variant == 1) {
        do_obj.multiplier = program_obj.end[do_obj.index][0] - do_obj.value;
    }
    switch (do_obj.variant) {
        case 0:
            do_obj.program.push(generateAssignPre(do_obj, do_obj.index, do_obj.multiplier, 1, 1));
            break;
    
        default:
            do_obj.program.push(generateAssignPre(do_obj, do_obj.index, do_obj.multiplier, 2, 1));
            break;
    }
    do_obj.program.push(generateAssignPre(do_obj, do_obj.index2, do_obj.multiplier, do_obj.variant2, do_obj.change2));
    do_obj.end[do_obj.index] = [do_obj.value];
    program_obj.end = do_obj.end;
    return do_obj;
}

function generateGuardPre(program_obj:Program): Guard{
    var guard_obj: Guard = {
        type: "guard",
        length: getRandomInt(1)+2,
        program: [],
        end: [],
        start: [],
        before: [],
        bool: false,
    }
    for (let i = 0; i < program_obj.end.length; i++) {
        guard_obj.end.push([]);
        
    }
    guard_obj.before = [...program_obj.end]
    for (let i = 0; i < guard_obj.length; i++) {
        program_obj.end = [...guard_obj.before];
        guard_obj.program.push(generateIfPre(program_obj, true));
        for (let j = 0; j < guard_obj.end.length; j++) {
            for (let k = 0; k < program_obj.end[j].length; k++) {
                if(guard_obj.program[i].bool){
                    guard_obj.bool = true;
                    guard_obj.end[j].push(program_obj.end[j][k]);
                }
            }
            
        }

        
        
    }
    for (let i = 0; i < guard_obj.end.length; i++) {
        guard_obj.end[i] = [ ...new Set(guard_obj.end[i])];
        
    }
    if (guard_obj.bool){
        program_obj.end = guard_obj.end;
    }
    return guard_obj;

}
*/

function getRandomInt(max:number): number{
    return Math.floor(Math.random() * max);
}

function getInequality(inequality:number): string{
    switch (inequality) {
        case 0:
            return " = ";
        case 1:
            return " < ";
        case 2:
            return " <= ";
        case 3:
            return " > ";  
        case 4:
            return " >= ";      
    
        default:
            return "";
    }
}

function assembleProgram(program_obj:Program): [string, string, string]{
    let programStr:string = "";
    let programStrEnd:string = "";
    let programStrStart:string = "";
    let programStrQueue:string[] = [];
    if (program_obj.variant == 0){
        programStrStart += "{ ";
        programStrEnd += "{ ";
        for (let i = 0; i < program_obj.variable.length; i++) {
            if (i > 0){
                programStrStart += "& ";
                programStrEnd += "& ";
            }
            programStrStart += program_obj.variable[i] + getInequality(program_obj.starting_variable_inequality[i]) + program_obj.start[i][0] + " ";
            if (program_obj.end[i].length > 1){
                programStrEnd += "( "
            }
            for (let j = 0; j < program_obj.end[i].length; j++) {
                if (j > 0) {
                    programStrEnd += "| ";
                }
                programStrEnd += program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.end[i][j] + " ";
                
            }
            if (program_obj.end[i].length > 1){
                programStrEnd += ") "
            }    
            
        }
        programStrStart += "}\n";
        programStrEnd += "}\n";
    } else{
        programStr += "{ ";
        programStrEnd += "{ ";
        for (let i = 0; i < program_obj.variable.length; i++) {
            if (i > 0){
                programStr += "& ";
                programStrEnd += "& ";
            }
            if (program_obj.start[i].length > 1){
                programStr += "( "
            }
            for (let j = 0; j < program_obj.start[i].length; j++) {
                if (j > 0) {
                    programStr += "| ";
                }
                programStr += program_obj.variable[i] + getInequality(program_obj.starting_variable_inequality[i]) + program_obj.start[i][j] + " ";
                
            }
            if (program_obj.start[i].length > 1){
                programStr += ") "
            }  
            if (program_obj.end[i].length > 1){
                programStrEnd += "( "
            }
            for (let j = 0; j < program_obj.end[i].length; j++) {
                if (j > 0) {
                    programStrEnd += "| ";
                }
                programStrEnd += program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.end[i][j] + " ";
                
            }
            if (program_obj.end[i].length > 1){
                programStrEnd += ") "
            }  
            
        }
        programStr += "}\n";
        programStrEnd += "}\n";
        //programStr += "{ x }\n";
        programStrQueue.push(programStrEnd);
    }
    for (let i = 0; i < program_obj.length; i++) {
        switch (program_obj.program[i].type) {
            case "skip":
                programStr += assembleSkip();
                break;
            case "assign":
                programStr += assembleAssign(program_obj.program[i] as Assign);
                break;
            case "if":
                programStr += assembleIf(program_obj.program[i] as If, false);
                break;
            case "do":
                programStr += assembleDo(program_obj.program[i] as Do, program_obj);
                break;
            case "guard":
                programStr += assembleGuard(program_obj.program[i] as Guard);
                break;
            default:
                break;
        }
        if(program_obj.length - i > 1){
            programStr += ";\n";
        }
        else{
            programStr += "\n";
        }
    }
    while(programStrQueue.length > 0){
        programStr += programStrQueue.pop();
    }
    return [programStr, programStrEnd, programStrStart];
}

function assembleSkip(){
    return "skip"
}

function assembleAssign(assign_obj:Assign): string{
    switch (assign_obj.variant) {
        case 0:
            return assign_obj.variable[assign_obj.index] + " := " + assign_obj.assign;
        case 1:
            return assign_obj.variable[assign_obj.index] + " := " + assign_obj.variable[assign_obj.index] + " + " + assign_obj.assign;
        case 2:
            return assign_obj.variable[assign_obj.index] + " := " + assign_obj.variable[assign_obj.index] + " - " + assign_obj.assign;
    
        default:
            return "";
            break;
    }
}

function assembleIf(if_obj:If, isGuard:boolean): string{
    let ifStr:string = "if\n\t";
    if (isGuard){
        ifStr = "";
    }
    switch (if_obj.variant) {
        case 0:
            ifStr += "true -> ";
            break;
        case 1:
            ifStr += if_obj.variable[if_obj.index] + " = " +  if_obj.value + " -> ";
            break;
        case 2:
            ifStr += if_obj.variable[if_obj.index] + " > " +  if_obj.value + " -> ";
            break;
        case 3:
            ifStr += if_obj.variable[if_obj.index] + " >= " +  if_obj.value + " -> ";
            break;
        case 4:
            ifStr += if_obj.variable[if_obj.index] + " < " +  if_obj.value + " -> ";
            break;
        case 5:
            ifStr += if_obj.variable[if_obj.index] + " <= " +  if_obj.value + " -> ";
            break;
        case 6:
            ifStr += if_obj.variable[if_obj.index] + " != " +  if_obj.value + " -> ";
            break;

        default:
            break;
    }
    switch (if_obj.program[0].type) {
        case "skip":
            ifStr += assembleSkip();
            break;
        case "assign":
            ifStr += assembleAssign(if_obj.program[0] as Assign);
            break;
        default:
            break;
    }
    if (!isGuard){
        ifStr += "\nfi";
    }
    return ifStr;
}


function assembleDo(do_obj:Do, program_obj:Program): string{
    let doStr:string = "do";
    switch (do_obj.variant) {
        case 0:
            doStr += "[ "
            for (let i = 0; i < do_obj.before.length; i++) {
                if (i > 0){
                    doStr += " & ";
                }
                if (i == do_obj.index){
                    doStr += do_obj.value + " >= " + do_obj.variable[i];
                }
                else if( i == do_obj.index2){
                    if (do_obj.before[i].length > 1 || do_obj.before[do_obj.index2].length > 1){
                        doStr += "( "
                    }
                    for (let k = 0; k < do_obj.before[do_obj.index2].length; k++) {
                        if ( k > 0) {
                            doStr += " | ";
                        }
                        doStr += do_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + do_obj.before[i][k];
                        if (do_obj.variant2 == 1){
                            doStr += " + ";
                        } else {
                            doStr += " - ";
                        }
                        doStr += do_obj.change2 + " * (" + do_obj.variable[do_obj.index] + " + " + (0-do_obj.before[do_obj.index][0]) + ")";
                    }
                        
                    if (do_obj.before[i].length > 1 || do_obj.before[do_obj.index2].length > 1){
                        doStr += ")"
                    }
                } else {
                    if (do_obj.before[i].length > 1){
                        doStr += "( "
                    }
                    for (let j = 0; j < do_obj.before[i].length; j++) {
                        if (j > 0) {
                            doStr += " | ";
                        }
                        doStr += do_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + do_obj.before[i][j];
                    }
                    if (do_obj.before[i].length > 1){
                        doStr += " )";
                    }
                }
            }
            for (let i = do_obj.before.length; i < program_obj.start.length; i++){
                doStr += " & " + program_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + program_obj.start[i];
            }
            doStr += " ]\n\t";
            doStr += do_obj.value + " > " + do_obj.variable[do_obj.index] + " -> "
            break;
        case 1:
            doStr += "[ "
            for (let i = 0; i < do_obj.before.length; i++) {
                if ( i > 0){
                    doStr += " & ";
                }
                if (i == do_obj.index){
                    doStr += do_obj.value + " <= " + do_obj.variable[i];
                }
                else if( i == do_obj.index2){
                    if (do_obj.before[i].length > 1 || do_obj.before[do_obj.index2].length > 1){
                        doStr += "( "
                    }
                    for (let k = 0; k < do_obj.before[do_obj.index2].length; k++) {
                        if ( k > 0) {
                            doStr += " | ";
                        }
                        doStr += do_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + do_obj.before[i][k];
                        if (do_obj.variant2 == 1){
                            doStr += " + ";
                        } else {
                            doStr += " - ";
                        }
                        doStr += do_obj.change2 + " * (-(" + do_obj.variable[do_obj.index] + " + " + (0-do_obj.before[do_obj.index][0]) + "))";
                    }
                        
                    if (do_obj.before[i].length > 1 || do_obj.before[do_obj.index2].length > 1){
                        doStr += ")";
                    }
                } else {
                    if (do_obj.before[i].length > 1){
                        doStr += "( "
                    }
                    for (let j = 0; j < do_obj.before[i].length; j++) {
                        if (j > 0) {
                            doStr += " | ";
                        }
                        doStr += do_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + do_obj.before[i][j];
                    }
                    if (do_obj.before[i].length > 1){
                        doStr += " )"
                    }
                }
            }
            for (let i = do_obj.before.length; i < program_obj.start.length; i++){
                doStr += " & " + program_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + program_obj.start[i];
            }
            doStr += " ]\n\t";
            doStr += do_obj.value + " < " + do_obj.variable[do_obj.index] + " -> "
            break;

        default:
            break;
    }
    for (let i = 0; i < do_obj.program.length; i++) {
        if(i > 0){
            doStr += ";\n\t";
        }
        switch (do_obj.program[i].type) {
            case "skip":
                doStr += assembleSkip();
                break;
            case "assign":
                doStr += assembleAssign(do_obj.program[i] as Assign);
                break;
            default:
                break;
        } 
    }
    doStr += "\nod";
    return doStr;
}

function assembleGuard(guard_obj: Guard): string{
    let guard_str: string = "if\n\t";
    for (let i = 0; i < guard_obj.length; i++) {
        if (i > 0){
            guard_str += "\n[]\n\t"
        }
        guard_str += assembleIf(guard_obj.program[i] as If, true);
    }
    guard_str += "\nfi";
    return guard_str;
}