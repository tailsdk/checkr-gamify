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
}

type If = {
    type: string;
    variant: number;
    index: number;
    program: (Skip|Assign|If|Do)[];
    value: number;
    bool: boolean[];
    end: number[][];
    variable: string[];
    variable_inequality: number[];
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
    end: number[][];
    before: number[][];
    bool: boolean;
}

export function generateTemplate(selected:string): string{
    switch (selected) {
        case "Completly Random":
            return generateProgram();
        case "Skip":
            return generateProgram(1, [0]);
        case "Assign":
            return generateProgram(1, [1]);
        case "If Statement":
            return generateProgram(1, [2]);   
        case "Loop":
            return generateProgram(1, [3]);
        case "Guard":
            return generateProgram(1, [4]);    
    
        default:   
            break;
    }
    return "";
}

function generateProgram(length:number = getRandomInt(randomLength)+1, predefinedProgram:number[] = []): string {
    let program_obj: Program = {
        type: "program",
        variant: getRandomInt(2),
        program: [],
        program_template: predefinedProgram,
        start: [],
        end: [],
        variable: [],
        variable_inequality: [],
        length: length,
        bool: [true]
    };
    for (let i = 0; i <= getRandomInt(2); i++) {
        program_obj.variable.push(String.fromCharCode(97+i));
        program_obj.variable_inequality.push(getRandomInt(5));
        program_obj.start.push([getRandomInt(randomValue)-10]);
        program_obj.end.push(program_obj.start[i])
    }

    for (let i = program_obj.program_template.length; i < program_obj.length; i++) {
        program_obj.program_template.push(getRandomInt(5));
    }

    for (let i = 0; i < program_obj.program_template.length; i++) {
        switch (program_obj.program_template[i]) {
            case 0:
                program_obj.program.push(generateSkip());
                break;
            case 1:
                program_obj.program.push(generateAssign(program_obj));
                break;
            case 2:
                program_obj.program.push(generateIf(program_obj));
                break;
            case 3:
                program_obj.program.push(generateDo(program_obj));
                break;
            case 4:
                program_obj.program.push(generateGuard(program_obj));
                break;
        
            default:
                break;
        }
        
    }
    console.log(program_obj);
    return parseProgram(program_obj);
}

function generateSkip(){
    let skip: Skip = {
        type: "skip"
    }
    return skip;
} 

function generateAssign(program_obj:Program | If | Do, index:number = getRandomInt(program_obj.variable.length), multiplier:number = 1, variant:number = getRandomInt(3), assign:number = getRandomInt(randomValue)-10): Assign{
    let assign_obj: Assign = {
        type: "assign",
        variant: variant,
        index: index,
        assign: assign,
        variable: program_obj.variable,
        end: [...program_obj.end],
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
    console.log(assign_obj.end[assign_obj.index]);
    assign_obj.end[assign_obj.index] = [ ...new Set(assign_obj.end[assign_obj.index])]
    program_obj.end[assign_obj.index] = assign_obj.end[assign_obj.index];
    return assign_obj;
}

function generateIf(program_obj: Program, isGuard:boolean = false): If{
    var if_obj: If = {
        type: "if",
        variant: getRandomInt(7),
        index: getRandomInt(program_obj.variable.length),
        program: [],
        value: getRandomInt(randomValue)-10,
        bool: [],
        end: [...program_obj.end],
        variable: program_obj.variable,
        variable_inequality: program_obj.variable_inequality,
    }
    console.log(program_obj.end[if_obj.index].length);
    console.log(if_obj.variant);
    console.log(program_obj.variable_inequality[if_obj.index]);
    console.log("done");
    switch (if_obj.variant) {
        case 0:
            if_obj.bool = [true];
            break;
        case 1:
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (program_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] == if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] < if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
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
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (program_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
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
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (program_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] >= if_obj.value));
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
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (program_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] < if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] > if_obj.value));
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
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (program_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 2:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if(!if_obj.bool[i]){
                            if_obj.bool.push(true);
                        }
                        break;
                    case 3:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
                        if(if_obj.bool[i]){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 4:
                        if_obj.bool.push((program_obj.end[if_obj.index][i] <= if_obj.value));
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
            for (let i = 0; i < program_obj.end[if_obj.index].length; i++) {
                switch (program_obj.variable_inequality[if_obj.index]) {
                    case 0:
                        if_obj.bool.push(!(program_obj.end[if_obj.index][i] == if_obj.value));
                        break;
                    case 1:
                        if_obj.bool.push(true);
                        if((program_obj.end[if_obj.index][i] > if_obj.value)){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 2:
                        if_obj.bool.push(true);
                        if((program_obj.end[if_obj.index][i] >= if_obj.value)){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 3:
                        if_obj.bool.push(true);
                        if((program_obj.end[if_obj.index][i] < if_obj.value)){
                            if_obj.bool.push(false);
                        }
                        break;
                    case 4:
                        if_obj.bool.push(true);
                        if((program_obj.end[if_obj.index][i] <= if_obj.value)){
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
                console.log("got here");
                if_obj.bool = [true];
            }
        }
    }
    switch (getRandomInt(2)) {
        case 0:
            if_obj.program.push(generateSkip());
            break;
        case 1:
            if_obj.program.push(generateAssign(if_obj));
            break;
    
        default:
            break;
    }
    program_obj.end = if_obj.end;
    return if_obj;
}

function generateDo(program_obj:Program): Do{
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
    console.log(do_obj.bool);
    console.log(do_obj.multiplier);
    switch (do_obj.variant) {
        case 0:
            do_obj.program.push(generateAssign(do_obj, do_obj.index, do_obj.multiplier, 1, 1));
            break;
    
        default:
            do_obj.program.push(generateAssign(do_obj, do_obj.index, do_obj.multiplier, 2, 1));
            break;
    }
    do_obj.program.push(generateAssign(do_obj, do_obj.index2, do_obj.multiplier, do_obj.variant2, do_obj.change2));
    do_obj.end[do_obj.index] = [do_obj.value];
    program_obj.end = do_obj.end;
    return do_obj;
}

function generateGuard(program_obj:Program): Guard{
    var guard_obj: Guard = {
        type: "guard",
        length: getRandomInt(1)+2,
        program: [],
        end: [],
        before: [],
        bool: false,
    }
    for (let i = 0; i < program_obj.end.length; i++) {
        guard_obj.end.push([]);
        
    }
    guard_obj.before = [...program_obj.end]
    for (let i = 0; i < guard_obj.length; i++) {
        program_obj.end = [...guard_obj.before];
        guard_obj.program.push(generateIf(program_obj, true));
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
    console.log(...program_obj.end);
    return guard_obj;

}

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

function parseProgram(program_obj:Program): string{
    let programStr:string = "";
    let programStrTemp:string = "";
    let programStrQueue:string[] = [];
    if (program_obj.variant == 0){
        //programStr += "{ a = " + program_obj.start + " }\n";
        programStr += "{ ";
        programStrTemp += "{ ";
        for (let i = 0; i < program_obj.variable.length; i++) {
            if (i > 0){
                programStr += "& ";
                programStrTemp += "& ";
            }
            programStr += program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.start[i][0] + " ";
            if (program_obj.end[i].length > 1){
                programStrTemp += "( "
            }
            for (let j = 0; j < program_obj.end[i].length; j++) {
                if (j > 0) {
                    programStrTemp += " | ";
                }
                programStrTemp += program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.end[i][j] + " ";
                
            }
            if (program_obj.end[i].length > 1){
                programStrTemp += ") "
            }    
            
        }
        programStr += "}\n";
        programStrTemp += "}\n";
        programStrQueue.push(programStrTemp);
        //programStrQueue.push("{ x }\n");
    } else{
        programStr += "{ ";
        programStrTemp += "{ ";
        for (let i = 0; i < program_obj.variable.length; i++) {
            if (i > 0){
                programStr += "& ";
                programStrTemp += "& ";
            }
            programStr += program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.start[i] + " ";
            if (program_obj.end[i].length > 1){
                programStrTemp += "( "
            }
            for (let j = 0; j < program_obj.end[i].length; j++) {
                if (j > 0) {
                    programStrTemp += " | ";
                }
                programStrTemp += program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.end[i][j] + " ";
                
            }
            if (program_obj.end[i].length > 1){
                programStrTemp += ") "
            }  
            
        }
        programStr += "}\n";
        programStrTemp += "}\n";
        //programStr += "{ x }\n";
        programStrQueue.push(programStrTemp);
    }
    for (let i = 0; i < program_obj.length; i++) {
        switch (program_obj.program[i].type) {
            case "skip":
                programStr += parseSkip();
                break;
            case "assign":
                programStr += parseAssign(program_obj.program[i] as Assign);
                break;
            case "if":
                programStr += parseIf(program_obj.program[i] as If, false);
                break;
            case "do":
                programStr += parseDo(program_obj.program[i] as Do, program_obj);
                break;
            case "guard":
                programStr += parseGuard(program_obj.program[i] as Guard);
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
    return programStr;
}

function parseSkip(){
    return "skip"
}

function parseAssign(assign_obj:Assign): string{
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

function parseIf(if_obj:If, isGuard:boolean): string{
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
            ifStr += parseSkip();
            break;
        case "assign":
            ifStr += parseAssign(if_obj.program[0] as Assign);
            break;
        default:
            break;
    }
    if (!isGuard){
        ifStr += "\nfi";
    }
    return ifStr;
}


function parseDo(do_obj:Do, program_obj:Program): string{
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
                    if (do_obj.end[i].length > 1 || do_obj.before[do_obj.index2].length > 1){
                        doStr += "( "
                    }
                    for (let k = 0; k < do_obj.before[do_obj.index2].length; k++) {
                        console.log(do_obj.before[do_obj.index2].length);
                        console.log(do_obj.before[do_obj.index2]);
                        if ( k > 0) {
                            doStr += " | ";
                        }
                        doStr += do_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + do_obj.before[i][k];
                        if (do_obj.variant2 == 1){
                            doStr += " + ";
                        } else {
                            doStr += " - ";
                        }
                        doStr += do_obj.change2 + " * (" + do_obj.variable[do_obj.index] + " + " + (0-do_obj.before[do_obj.index][0]) + ")";
                    }
                        
                    if (do_obj.end[i].length > 1 || do_obj.before[do_obj.index2].length > 1){
                        doStr += " )"
                    }
                } else {
                    if (do_obj.end[i].length > 1){
                        doStr += "( "
                    }
                    for (let j = 0; j < do_obj.end[i].length; j++) {
                        if (j > 0) {
                            doStr += " | ";
                        }
                        doStr += do_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + do_obj.before[i][j];
                    }
                    if (do_obj.end[i].length > 1){
                        doStr += " )"
                    }
                }
            }
            for (let i = do_obj.before.length; i < program_obj.start.length; i++){
                doStr += " & " + program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.start[i];
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
                    if (do_obj.end[i].length > 1 || do_obj.before[do_obj.index2].length > 1){
                        doStr += "( "
                    }
                    for (let k = 0; k < do_obj.before[do_obj.index2].length; k++) {
                        console.log(do_obj.before[do_obj.index2].length);
                        console.log(do_obj.before[do_obj.index2]);
                        if ( k > 0) {
                            doStr += " | ";
                        }
                        doStr += do_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + do_obj.before[i][k];
                        if (do_obj.variant2 == 1){
                            doStr += " + ";
                        } else {
                            doStr += " - ";
                        }
                        doStr += do_obj.change2 + " * (-(" + do_obj.variable[do_obj.index] + " + " + (0-do_obj.before[do_obj.index][0]) + "))";
                    }
                        
                    if (do_obj.end[i].length > 1 || do_obj.before[do_obj.index].length > 1){
                        doStr += " )"
                    }
                } else {
                    if (do_obj.end[i].length > 1){
                        doStr += "( "
                    }
                    for (let j = 0; j < do_obj.end[i].length; j++) {
                        if (j > 0) {
                            doStr += " | ";
                        }
                        doStr += do_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + do_obj.before[i][j];
                    }
                    if (do_obj.end[i].length > 1){
                        doStr += " )"
                    }
                }
            }
            for (let i = do_obj.before.length; i < program_obj.start.length; i++){
                doStr += " & " + program_obj.variable[i] + getInequality(program_obj.variable_inequality[i]) + program_obj.start[i];
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
                doStr += parseSkip();
                break;
            case "assign":
                doStr += parseAssign(do_obj.program[i] as Assign);
                break;
            default:
                break;
        } 
    }
    doStr += "\nod";
    return doStr;
}

function parseGuard(guard_obj: Guard): string{
    let guard_str: string = "if\n\t";
    for (let i = 0; i < guard_obj.length; i++) {
        if (i > 0){
            guard_str += "\n[]\n\t"
        }
        guard_str += parseIf(guard_obj.program[i] as If, true);
    }
    guard_str += "\nfi";
    return guard_str;
}