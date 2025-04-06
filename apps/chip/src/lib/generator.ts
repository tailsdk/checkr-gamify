let randomValue = 20;
let randomLength = 5;

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
    can_be_stuck: boolean;
}

type Skip = {
    type: string;
    end: number[][];
    start: number[][];
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
    can_be_stuck: boolean;
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
    end: number[][];
    start: number[][];
    bool: boolean[];
    change2: number;
    variant: number;
    variant2: number;
    multiplier: number;
    program_variant: number;
}

type Guard = {
    type: string;
    length: number;
    program: (If)[];
    start: number[][];
    end: number[][];
    bool: boolean[];
    variable: string[];
    variable_inequality: number[];
    can_be_stuck: boolean;
}

export function generateTemplate(selected:string, selected2:string): [string, string, string, number]{
    let inequality:number = 1;
    let template:number[] = [];
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
            for (let i = 0; i < getRandomInt(randomLength)+1; i++) {
                template.push(getRandomInt(5));
            }
            break;
        case "Skip":
            template = [0];
            break;
        case "Assign":
            template = [1];
            break;
        case "If Statement":
            template = [2];
            break;   
        case "Loop":
            template = [3];
            break;
        case "Multiple If Statements":
            template = [4];
            break;   
    
        default:   
            break;
    }
    switch (getRandomInt(2)) {
        case 0:
            return generateProgramPost(inequality, template);
        case 1:
            return generateProgramPre(inequality, template);
    
        default:
            break;
    }
    return ["","", "", -1];
}

function generateProgramPost(inequality:number, predefinedProgram:number[]): [string, string, string, number] {
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
        length: predefinedProgram.length,
        bool: [true],
        start_variables: getRandomInt(2)+1,
        can_be_stuck: false,
    };
    //initilalize variables
    for (let i = 0; i < program_obj.start_variables; i++) {
        program_obj.variable.push(String.fromCharCode(97+i));
        program_obj.starting_variable_inequality.push(getRandomInt(inequality));
        program_obj.start.push([getRandomInt(randomValue)-10]);
        program_obj.variable_inequality.push(program_obj.starting_variable_inequality[i]);
        program_obj.end.push(program_obj.start[i])
    }
    //generate commands
    for (let i = 0; i < program_obj.program_template.length; i++) {
        switch (program_obj.program_template[i]) {
            case 0:
                program_obj.program.push(generateSkip(program_obj));
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
    console.log(program_obj);
    return assembleProgram(program_obj);
}

function generateSkip(program_obj:(Program | If | Do)){
    let skip: Skip = {
        type: "skip",
        start: [...program_obj.start],
        end: [...program_obj.end],
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
        start: [...program_obj.end],
    }
    assign_obj.end[assign_obj.index] = [];
    //loop checks through the bool of the parent object and only applies the value if the value is true
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
    }
    //removes extra copies of the same values and applies the new end value to the parent object
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
        end: [...program_obj.end],
        start: [...program_obj.end],
        variable: program_obj.variable,
        variable_inequality: [],
        can_be_stuck: program_obj.can_be_stuck,
    }
    if_obj.variable_inequality = [...program_obj.variable_inequality];
    //if statement that decides the bool variables for each variation with respect to inequalities and applies false if the parent bool is set to false
    if(program_obj.bool){
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
    }
    else{
        if_obj.bool = [false];
    }
    //checks if any scenerios made it possible to get stuck
    if(if_obj.bool.indexOf(false) > -1){
        if_obj.can_be_stuck = true;
    }
    //adds commands within the if command
    switch (getRandomInt(2)) {
        case 0:
            if_obj.program.push(generateSkip(if_obj));
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
    //applies the values of the if statement if the bool value is true and it is not within a guard command
    if(program_obj.bool.indexOf(true) > -1 && !isGuard){
        program_obj.end = if_obj.end;
        program_obj.variable_inequality = [...if_obj.variable_inequality]
        if (if_obj.bool.indexOf(true) > -1) {
            program_obj.bool = [true];
        } else {
            program_obj.bool = [false];
        }
        program_obj.can_be_stuck = if_obj.can_be_stuck;
    }
    return if_obj;
}

function generateDoPost(program_obj:Program): Do{
    var do_obj: Do = {
        type: "do",
        value: 0,
        value2: 0,
        index2: getRandomInt(program_obj.variable.length),
        index: program_obj.variable.length,
        variable: [],
        variable_inequality: [],
        program: [],
        end: [],
        start: [],
        bool: [...program_obj.bool],
        change2: getRandomInt(20)-10,
        variant: getRandomInt(2),
        variant2: getRandomInt(2)+1,
        multiplier: 1,
        program_variant: program_obj.variant,
    };
    switch (do_obj.variant) {
        case 0:
            //initialize new variable
            program_obj.variable.push(String.fromCharCode(97+program_obj.variable.length));
            do_obj.variable = program_obj.variable;
            program_obj.variable_inequality.push(0);
            program_obj.starting_variable_inequality.push(0);
            do_obj.variable_inequality = [...program_obj.variable_inequality];
            do_obj.value = getRandomInt(20) - 10;
            do_obj.value2 = -getRandomInt(9) + do_obj.value - 1; 
            program_obj.start.push([do_obj.value2]);
            program_obj.end.push([do_obj.value2]); 
            do_obj.end = [...program_obj.end];
            do_obj.start = [...program_obj.end];
            do_obj.multiplier = (do_obj.value - do_obj.value2);
            //add commands
            do_obj.program.push(generateAssignPost(do_obj, do_obj.index, do_obj.multiplier, 1, 1));
            do_obj.program.push(generateAssignPost(do_obj, do_obj.index2, do_obj.multiplier, do_obj.variant2, do_obj.change2));
            do_obj.end[do_obj.index] = [do_obj.value];
            break;
    
        case 1:
            //initialize new variable
            program_obj.variable.push(String.fromCharCode(97+program_obj.variable.length));
            do_obj.variable = program_obj.variable;
            program_obj.variable_inequality.push(0);
            program_obj.starting_variable_inequality.push(0);
            do_obj.variable_inequality = [...program_obj.variable_inequality];
            do_obj.value = getRandomInt(20) - 10; 
            do_obj.value2 = getRandomInt(9) + do_obj.value + 1;
            program_obj.start.push([do_obj.value2]);
            program_obj.end.push([do_obj.value2]);
            do_obj.end = [...program_obj.end];
            do_obj.start = [...program_obj.end];
            do_obj.multiplier = do_obj.value2 - do_obj.value;
            //add commands
            do_obj.program.push(generateAssignPost(do_obj, do_obj.index, do_obj.multiplier, 2, 1));
            do_obj.program.push(generateAssignPost(do_obj, do_obj.index2, do_obj.multiplier, do_obj.variant2, do_obj.change2));
            do_obj.end[do_obj.index] = [do_obj.value];
            break;
        default:
            break;
    }
    //save new value
    program_obj.end = do_obj.end;
    return do_obj;
}

function generateGuardPost(program_obj:Program): Guard{
    var guard_obj: Guard = {
        type: "guard",
        length: getRandomInt(2)+2,
        program: [],
        end: [...program_obj.end],
        start: [...program_obj.end],
        bool: [false],
        variable: [...program_obj.variable],
        variable_inequality: [...program_obj.variable_inequality],
        can_be_stuck: false,
    }
    //create a temporary variable to combine the end of all if statements
    let new_value:number[][] = [];
    for (let i = 0; i < program_obj.end.length; i++) {
        new_value.push([]);
        
    }
    for (let i = 0; i < guard_obj.length; i++) {
        //reset the end object
        guard_obj.end = [...guard_obj.start];
        //add command
        guard_obj.program.push(generateIfPost(guard_obj, true));
        //if the parent object bool is true add the values from the if statement to the temp value and check for truth values
        if(program_obj.bool){
            for (let j = 0; j < guard_obj.end.length; j++) {
                for (let k = 0; k < program_obj.end[j].length; k++) {
                    for (let u = 0; u < guard_obj.program[i].bool.length; u++) {
                        if (guard_obj.program[i].bool[u]){
                            new_value[j].push(guard_obj.program[i].end[j][k]);
                            if (!guard_obj.bool[0]) {
                                guard_obj.bool = [true];
                            }
                            if (!guard_obj.program[i].can_be_stuck && guard_obj.can_be_stuck){
                                guard_obj.can_be_stuck = true;
                            }
                        }
                        else {
                            guard_obj.can_be_stuck = true;
                        }
                    }
                } 
            }
        }
    }
    //if the parent opbjects truth value is true then update it
    if(program_obj.bool.indexOf(true) > -1){
        for (let i = 0; i < new_value.length; i++) {
            new_value[i] = [ ...new Set(new_value[i])];
            
        }
        program_obj.end = [...new_value];
        program_obj.variable_inequality = guard_obj.variable_inequality;
        program_obj.bool = guard_obj.bool;
        if (!program_obj.can_be_stuck){
            program_obj.can_be_stuck = guard_obj.can_be_stuck;
        }
    }
    return guard_obj;

}

function generateProgramPre(inequality:number, predefinedProgram:number[]): [string, string, string, number] {
    let program_obj: Program = {
        type: "program",
        variant: 1,
        program: [],
        program_template: predefinedProgram,
        start: [],
        end: [],
        variable: [],
        variable_inequality: [],
        starting_variable_inequality: [],
        length: predefinedProgram.length,
        bool: [true],
        start_variables: getRandomInt(2)+1,
        can_be_stuck: false,
    };
    //initialize variables
    for (let i = 0; i < program_obj.start_variables; i++) {
        program_obj.variable.push(String.fromCharCode(97+i));
        program_obj.starting_variable_inequality.push(getRandomInt(inequality));
        program_obj.start.push([getRandomInt(randomValue)-10]);
        program_obj.variable_inequality.push(program_obj.starting_variable_inequality[i]);
        program_obj.end.push(program_obj.start[i])
    }
    //add commands
    for (let i = program_obj.length-1; i >= 0; i--) {
        switch (program_obj.program_template[i]) {
            case 0:
                program_obj.program.unshift(generateSkip(program_obj));
                break;
            case 1:
                program_obj.program.unshift(generateAssignPre(program_obj));
                break;
            case 2:
                program_obj.program.unshift(generateIfPre(program_obj));
                break;
            case 3:
                program_obj.program.unshift(generateDoPre(program_obj));
                break;
            case 4:
                program_obj.program.unshift(generateGuardPre(program_obj));
                break;
        
            default:
                break;
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
        end: [...program_obj.start],
        start: [...program_obj.start],
    }
    assign_obj.start[assign_obj.index] = []; 
    //loop checks through the bool of the parent object and only applies the value if the value is true
    for (let j = 0; j < program_obj.bool.length; j++) {
        if(program_obj.bool[j]){
            switch (assign_obj.variant) {
                case 1:
                    for (let i = 0; i < program_obj.start[assign_obj.index].length; i++) {
                        assign_obj.start[assign_obj.index].push(program_obj.start[assign_obj.index][i] - assign_obj.assign * multiplier);
                    }
                    break;
                case 2:
                    for (let i = 0; i < program_obj.start[assign_obj.index].length; i++) {
                        assign_obj.start[assign_obj.index].push(program_obj.start[assign_obj.index][i] + assign_obj.assign * multiplier);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    //removes extra copies of the same values and applies the new end value to the parent object
    assign_obj.start[assign_obj.index] = [ ...new Set(assign_obj.start[assign_obj.index])]
    program_obj.start[assign_obj.index] = assign_obj.start[assign_obj.index];
    return assign_obj;
}

function generateIfPre(program_obj: (Program | Guard), isGuard:boolean = false): If{
    var if_obj: If = {
        type: "if",
        variant: getRandomInt(7),
        index: getRandomInt(program_obj.variable.length),
        program: [],
        value: getRandomInt(randomValue)-10,
        bool: [true],
        end: [...program_obj.start],
        start: [...program_obj.start],
        variable: program_obj.variable,
        variable_inequality: [...program_obj.variable_inequality],
        can_be_stuck: program_obj.can_be_stuck,
    }
    //add commands
    switch (getRandomInt(2)) {
        case 0:
            if_obj.program.push(generateSkip(if_obj));
            break;
        case 1:
            if_obj.program.push(generateAssignPre(if_obj));
            break;
    
        default:
            break;
    }
    if_obj.bool = [];
    //if statement that decides the bool variables for each variation with respect to inequalities and applies false if the parent bool is set to false
    if(program_obj.bool){
        switch (if_obj.variant) {
            case 0:
                if_obj.bool = [true];
                break;
            case 1:
                for (let i = 0; i < program_obj.start[if_obj.index].length; i++) {
                    switch (if_obj.variable_inequality[if_obj.index]) {
                        case 0:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] == if_obj.value));
                            break;
                        case 1:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] > if_obj.value));
                            if_obj.bool.push((-10000 > if_obj.value));
                            break;
                        case 2:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] >= if_obj.value));
                            if_obj.bool.push((-10000 >= if_obj.value));
                            break;
                        case 3:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] < if_obj.value));
                            if_obj.bool.push((10000 < if_obj.value));
                            break;
                        case 4:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] <= if_obj.value));
                            if_obj.bool.push((10000 <= if_obj.value));
                            break;
                    
                        default:
                            break;
                    }
                }
                break;
            case 2:
                for (let i = 0; i < program_obj.start[if_obj.index].length; i++) {
                    switch (if_obj.variable_inequality[if_obj.index]) {
                        case 0:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] > if_obj.value));
                            break;
                        case 1:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] > if_obj.value));
                            if_obj.bool.push((-10000 > if_obj.value));
                            break;
                        case 2:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] > if_obj.value));
                            if_obj.bool.push((-10000 > if_obj.value));
                            break;
                        case 3:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] >= if_obj.value));
                            if_obj.bool.push((10000 > if_obj.value));
                            break;
                        case 4:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] > if_obj.value));
                            if_obj.bool.push((10000 > if_obj.value));
                            break;
                    
                        default:
                            break;
                    }
                }
                break;
            case 3:
                for (let i = 0; i < program_obj.start[if_obj.index].length; i++) {
                    switch (if_obj.variable_inequality[if_obj.index]) {
                        case 0:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] >= if_obj.value));
                            break;
                        case 1:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] >= if_obj.value));
                            if_obj.bool.push((-10000 >= if_obj.value));
                            break;
                        case 2:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] >= if_obj.value));
                            if_obj.bool.push((-10000 >= if_obj.value));
                            break;
                        case 3:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] >= if_obj.value));
                            if_obj.bool.push((10000 >= if_obj.value));
                            break;
                        case 4:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] >= if_obj.value));
                            if_obj.bool.push((10000 >= if_obj.value));
                            break;
                    
                        default:
                            break;
                    }
                }
                break;
            case 4:
                for (let i = 0; i < program_obj.start[if_obj.index].length; i++) {
                    switch (if_obj.variable_inequality[if_obj.index]) {
                        case 0:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] < if_obj.value));
                            break;
                        case 1:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] <= if_obj.value));
                            if_obj.bool.push((-10000 <= if_obj.value));
                            break;
                        case 2:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] < if_obj.value));
                            if_obj.bool.push((-10000 < if_obj.value));
                            break;
                        case 3:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] < if_obj.value));
                            if_obj.bool.push((10000 < if_obj.value));
                            break;
                        case 4:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] < if_obj.value));
                            if_obj.bool.push((10000 < if_obj.value));
                            break;
                    
                        default:
                            break;
                    }
                }
                break;
            case 5:
                for (let i = 0; i < program_obj.start[if_obj.index].length; i++) {
                    switch (if_obj.variable_inequality[if_obj.index]) {
                        case 0:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] <= if_obj.value));
                            break;
                        case 1:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] <= if_obj.value));
                            if_obj.bool.push((-10000 <= if_obj.value));
                            break;
                        case 2:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] <= if_obj.value));
                            if_obj.bool.push((-10000 <= if_obj.value));
                            break;
                        case 3:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] <= if_obj.value));
                            if_obj.bool.push((10000 <= if_obj.value));
                            break;
                        case 4:
                            if_obj.bool.push((program_obj.start[if_obj.index][i] <= if_obj.value));
                            if_obj.bool.push((10000 <= if_obj.value));
                            break;
                    
                        default:
                            break;
                    }
                }
                break;
            case 6:
                for (let i = 0; i < program_obj.start[if_obj.index].length; i++) {
                    switch (if_obj.variable_inequality[if_obj.index]) {
                        case 0:
                            if_obj.bool.push(!(program_obj.start[if_obj.index][i] == if_obj.value));
                            break;
                        case 1:
                            if_obj.bool.push(!(program_obj.start[if_obj.index][i] > if_obj.value));
                            if_obj.bool.push(!(-10000 > if_obj.value));
                            break;
                        case 2:
                            if_obj.bool.push(!(program_obj.start[if_obj.index][i] >= if_obj.value));
                            if_obj.bool.push(!(-10000 >= if_obj.value));
                            break;
                        case 3:
                            if_obj.bool.push(!(program_obj.start[if_obj.index][i] < if_obj.value));
                            if_obj.bool.push(!(10000 < if_obj.value));
                            break;
                        case 4:
                            if_obj.bool.push(!(program_obj.start[if_obj.index][i] <= if_obj.value));
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
    }
    else{
        if_obj.bool = [false];
    }
    //checks if any scenerios made it possible to get stuck
    if(if_obj.bool.indexOf(false) > -1){
        if_obj.can_be_stuck = true;
    }
    //applies the values of the if statement if the bool value is true and it is not within a guard command
    if(program_obj.bool.indexOf(true) > -1 && !isGuard){
        program_obj.start = if_obj.start;
        program_obj.variable_inequality = [...if_obj.variable_inequality]
        if (if_obj.bool.indexOf(true) > -1) {
            program_obj.bool = [true];
        } else {
            program_obj.bool = [false];
        }
        program_obj.can_be_stuck = if_obj.can_be_stuck;
    }
    return if_obj;
}

function generateDoPre(program_obj:Program): Do{
    var do_obj: Do = {
        type: "do",
        value:  0,
        value2:  0,
        index2: getRandomInt(program_obj.variable.length),
        index: program_obj.variable.length,
        variable: [],
        variable_inequality: [],
        program: [],
        end: [],
        start: [],
        bool: [...program_obj.bool],
        change2: getRandomInt(20)-10,
        variant: getRandomInt(2),
        variant2: getRandomInt(2)+1,
        multiplier: 1,
        program_variant: program_obj.variant,
    };
    switch (do_obj.variant) {
        case 0:
            //initialize new variable
            program_obj.variable.push(String.fromCharCode(97+program_obj.variable.length));
            do_obj.variable = program_obj.variable;
            program_obj.variable_inequality.push(0);
            program_obj.starting_variable_inequality.push(0);
            do_obj.variable_inequality = [...program_obj.variable_inequality];
            do_obj.value = getRandomInt(20) - 10;
            do_obj.value2 = -getRandomInt(9) + do_obj.value - 1; 
            program_obj.start.push([do_obj.value2]);
            program_obj.end.push([do_obj.value2]);
            do_obj.end = [...program_obj.start];
            do_obj.start = [...program_obj.start];
            do_obj.multiplier = (do_obj.value - do_obj.value2);
            //add commands
            do_obj.program.push(generateAssignPre(do_obj, do_obj.index, 0, 1, 1));
            do_obj.program.push(generateAssignPre(do_obj, do_obj.index2, do_obj.multiplier, do_obj.variant2, do_obj.change2));
            program_obj.end[do_obj.index] = [do_obj.value];
            do_obj.end[do_obj.index] = [do_obj.value];
            break;
        case 1:
            //initialize new variable
            program_obj.variable.push(String.fromCharCode(97+program_obj.variable.length));
            do_obj.variable = program_obj.variable;
            program_obj.variable_inequality.push(0);
            program_obj.starting_variable_inequality.push(0);
            do_obj.variable_inequality = [...program_obj.variable_inequality];
            do_obj.value = getRandomInt(20) - 10; 
            do_obj.value2 = getRandomInt(9) + do_obj.value + 1;
            program_obj.start.push([do_obj.value2]);
            program_obj.end.push([do_obj.value2]);
            do_obj.end = [...program_obj.start];
            do_obj.start = [...program_obj.start];
            do_obj.multiplier = do_obj.value2 - do_obj.value;
            //add commands
            do_obj.program.push(generateAssignPre(do_obj, do_obj.index, 0, 2, 1));
            do_obj.program.push(generateAssignPre(do_obj, do_obj.index2, do_obj.multiplier, do_obj.variant2, do_obj.change2));
            program_obj.end[do_obj.index] = [do_obj.value];
            do_obj.end[do_obj.index] = [do_obj.value];
            break;
    
        default:
            break;
    }
    //save new value
    program_obj.start = [...do_obj.start];
    return do_obj;
}

function generateGuardPre(program_obj:Program): Guard{
    var guard_obj: Guard = {
        type: "guard",
        length: getRandomInt(2)+2,
        program: [],
        end: [...program_obj.start],
        start: [...program_obj.start],
        bool: [false],
        variable: [...program_obj.variable],
        variable_inequality: [...program_obj.variable_inequality],
        can_be_stuck: false,
    }
    //create a temporary variable to combine the end of all if statements
    let new_value:number[][] = [];
    for (let i = 0; i < program_obj.start.length; i++) {
        new_value.push([]);
        
    }
    for (let i = 0; i < guard_obj.length; i++) {
        //reset the end object
        guard_obj.start = [...guard_obj.end];
        //add command
        guard_obj.program.push(generateIfPre(guard_obj, true));
        //if the parent object bool is true add the values from the if statement to the temp value and check for truth values
        if(program_obj.bool){
            for (let j = 0; j < guard_obj.start.length; j++) {
                for (let k = 0; k < program_obj.start[j].length; k++) {
                    for (let u = 0; u < guard_obj.program[i].bool.length; u++) {
                        if (guard_obj.program[i].bool[u]){
                            new_value[j].push(guard_obj.program[i].start[j][k]);
                            if (!guard_obj.bool[0]) {
                                guard_obj.bool = [true];
                            }
                            if (!guard_obj.program[i].can_be_stuck && guard_obj.can_be_stuck){
                                guard_obj.can_be_stuck = true;
                            }
                        }
                        else {
                            guard_obj.can_be_stuck = true;
                        }
                    }
                } 
            }
        }
    }
    //if the parent opbjects truth value is true then update it
    if(program_obj.bool.indexOf(true) > -1){
        for (let i = 0; i < new_value.length; i++) {
            new_value[i] = [ ...new Set(new_value[i])];
            
        }
        program_obj.start = [...new_value];
        program_obj.variable_inequality = guard_obj.variable_inequality;
        program_obj.bool = guard_obj.bool;
        if (!program_obj.can_be_stuck){
            program_obj.can_be_stuck = guard_obj.can_be_stuck;
        }
    }
    return guard_obj;
}

//gets a random integer within a range
function getRandomInt(max:number): number{
    return Math.floor(Math.random() * max);
}

//returns the inequality as a string
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

function assembleProgram(program_obj:Program): [string, string, string, number]{
    let programStr:string = "";
    let programStrEnd:string = "";
    let programStrStart:string = "";
    //make the postcondition and precondition
    if (program_obj.variant == 0){
        //check if the program can complete
        if(program_obj.bool.indexOf(true) > -1){
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
            //if the program can get stuck add | false
            if(program_obj.can_be_stuck){
                programStrEnd += "| false ";
            }
            programStrStart += "}\n";
            programStrEnd += "}\n";
        }
        else {
            programStrStart += "{ ";
            programStrEnd += "{ ";
            for (let i = 0; i < program_obj.variable.length; i++) {
                if (i > 0){
                    programStrStart += "& ";
                }
                programStrStart += program_obj.variable[i] + getInequality(program_obj.starting_variable_inequality[i]) + program_obj.start[i][0] + " ";
                
            }
            programStrEnd += "false ";
            programStrStart += "}\n";
            programStrEnd += "}\n";
        }
    } else{
        //check if the program can complete
        if(program_obj.bool.indexOf(true) > -1){
            programStrStart += "{ ";
            programStrEnd += "{ ";
            for (let i = 0; i < program_obj.variable.length; i++) {
                if (i > 0){
                    programStrStart += "& ";
                    programStrEnd += "& ";
                }
                programStrEnd += program_obj.variable[i] + getInequality(program_obj.starting_variable_inequality[i]) + program_obj.end[i][0] + " ";
                if (program_obj.start[i].length > 1){
                    programStrStart += "( "
                }
                for (let j = 0; j < program_obj.start[i].length; j++) {
                    if (j > 0) {
                        programStrStart += "& ";
                    }
                    programStrStart += program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.start[i][j] + " ";
                    
                }
                if (program_obj.start[i].length > 1){
                    programStrStart += ") "
                }    
                
            }
            //if the program can get stuck add & false
            if(program_obj.can_be_stuck){
                programStrStart += "& false ";
            }
            programStrStart += "}\n";
            programStrEnd += "}\n";
        }
        else {
            programStrStart += "{ ";
            programStrEnd += "{ ";
            for (let i = 0; i < program_obj.variable.length; i++) {
                if (i > 0){
                    programStrEnd += "& ";
                }
                programStrEnd += program_obj.variable[i] + getInequality(program_obj.starting_variable_inequality[i]) + program_obj.end[i][0] + " ";
                
            }
            programStrStart += "false ";
            programStrStart += "}\n";
            programStrEnd += "}\n";
        }
    }
    //generate text for the commands in order
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
    return [programStr, programStrEnd, programStrStart, program_obj.variant];
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
        //make the invariant
        case 0:
            doStr += "[ "
            //check if the bool value is true
            if (do_obj.bool[0]){
                for (let i = 0; i < do_obj.start.length; i++) {
                    //add & between variables
                    if (i > 0){
                        doStr += " & ";
                    }
                    //the counter variable
                    if (i == do_obj.index){
                        doStr += do_obj.value + " >= " + do_obj.variable[i];
                    }
                    //the variable that changes
                    else if( i == do_obj.index2){
                        if (do_obj.start[i].length > 1 || do_obj.start[do_obj.index2].length > 1){
                            doStr += "( "
                        }
                        for (let k = 0; k < do_obj.start[do_obj.index2].length; k++) {
                            if (k > 0) {
                                if (do_obj.program_variant == 0) {
                                    doStr += " | ";
                                } else if (do_obj.program_variant == 1) {
                                    doStr += " & ";
                                }
                            }
                            doStr += do_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + do_obj.start[i][k];
                            if (do_obj.variant2 == 1){
                                doStr += " + ";
                            } else {
                                doStr += " - ";
                            }
                            doStr += do_obj.change2 + " * (" + do_obj.variable[do_obj.index] + " + " + (0-do_obj.start[do_obj.index][0]) + ")";
                        }
                            
                        if (do_obj.start[i].length > 1 || do_obj.start[do_obj.index2].length > 1){
                            doStr += ")"
                        }
                    } 
                    //the other variables that do not change
                    else {
                        if (do_obj.start[i].length > 1){
                            doStr += "( "
                        }
                        for (let j = 0; j < do_obj.start[i].length; j++) {
                            if (j > 0) {
                                if (do_obj.program_variant == 0) {
                                    doStr += " | ";
                                } else if (do_obj.program_variant == 1) {
                                    doStr += " & ";
                                }
                            }
                            doStr += do_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + do_obj.start[i][j];
                        }
                        if (do_obj.start[i].length > 1){
                            doStr += " )";
                        }
                    }
                }
                // if there are extra variables that got added later in the program add them here
                if (do_obj.program_variant == 0){
                    for (let i = do_obj.start.length; i < program_obj.start.length; i++){
                        doStr += " & " + program_obj.variable[i] + " = " + program_obj.start[i];
                    }
                } else if (do_obj.program_variant == 1){
                    for (let i = do_obj.start.length; i < program_obj.end.length; i++){
                        doStr += " & " + program_obj.variable[i] + " = " + program_obj.end[i];
                    }
                }
            }
            else {
                doStr += "false";
            }
            doStr += " ]\n\t";
            doStr += do_obj.value + " > " + do_obj.variable[do_obj.index] + " -> "
            break;
        case 1:
            doStr += "[ "
            //check if the bool value is true
            if (do_obj.bool[0]){
                for (let i = 0; i < do_obj.start.length; i++) {
                    //add & between variables
                    if ( i > 0){
                        doStr += " & ";
                    }
                    //the counter variable
                    if (i == do_obj.index){
                        doStr += do_obj.value + " <= " + do_obj.variable[i];
                    }
                    //the variable that changes
                    else if( i == do_obj.index2){
                        if (do_obj.start[i].length > 1 || do_obj.start[do_obj.index2].length > 1){
                            doStr += "( "
                        }
                        for (let k = 0; k < do_obj.start[do_obj.index2].length; k++) {
                            if ( k > 0) {
                                if (do_obj.program_variant == 0) {
                                    doStr += " | ";
                                } else if (do_obj.program_variant == 1) {
                                    doStr += " & ";
                                }
                            }
                            doStr += do_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + do_obj.start[i][k];
                            if (do_obj.variant2 == 1){
                                doStr += " + ";
                            } else {
                                doStr += " - ";
                            }
                            doStr += do_obj.change2 + " * (-(" + do_obj.variable[do_obj.index] + " + " + (0-do_obj.start[do_obj.index][0]) + "))";
                        }
                            
                        if (do_obj.start[i].length > 1 || do_obj.start[do_obj.index2].length > 1){
                            doStr += ")";
                        }
                    }
                    //the other variables that do not change 
                    else {
                        if (do_obj.start[i].length > 1){
                            doStr += "( "
                        }
                        for (let j = 0; j < do_obj.start[i].length; j++) {
                            if (j > 0) {
                                if (do_obj.program_variant == 0) {
                                    doStr += " | ";
                                } else if (do_obj.program_variant == 1) {
                                    doStr += " & ";
                                }
                            }
                            doStr += do_obj.variable[i] + getInequality(do_obj.variable_inequality[i]) + do_obj.start[i][j];
                        }
                        if (do_obj.start[i].length > 1){
                            doStr += " )"
                        }
                    }
                }
                // if there are extra variables that got added later in the program add them here
                if (do_obj.program_variant == 0){
                    for (let i = do_obj.start.length; i < program_obj.start.length; i++){
                        doStr += " & " + program_obj.variable[i] + " = " + program_obj.start[i];
                    }
                } else if (do_obj.program_variant == 1){
                    for (let i = do_obj.start.length; i < program_obj.end.length; i++){
                        doStr += " & " + program_obj.variable[i] + " = " + program_obj.end[i];
                    }
                }
            } else {
                doStr += "false";
            }
            doStr += " ]\n\t";
            doStr += do_obj.value + " < " + do_obj.variable[do_obj.index] + " -> "
            break;

        default:
            break;
    }
    //add commands
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