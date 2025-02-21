let randomValue = 20;
let randomLength = 5;

type Program = {
    type: string;
    variant: number;
    program: (Skip|Assign|If|Do)[];
    program_template: number[];
    start: number[];
    end: number[];
    variable: string[];
    length: number;
    bool: boolean;
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
}

type If = {
    type: string;
    variant: number;
    index: number;
    program: (Skip|Assign|If|Do)[];
    value: number;
    bool: boolean;
    end: number[];
    variable: string[];
}

type Do = {
    type: string;
    value: number;
    value2: number;
    index: number;
    index2: number;
    variable: string[];
    program: (Skip|Assign|If|Do)[];
    before: number[];
    end: number[];
    bool: boolean;
    change2: number;
    variant: number;
    variant2: number;
    multiplier: number;
}

export function generateProgram(length:number = getRandomInt(randomLength)+1, predefinedProgram:number[] = []): string {
    let program_obj: Program = {
        type: "program",
        variant: getRandomInt(2),
        program: [],
        program_template: predefinedProgram,
        start: [],
        end: [],
        variable: [],
        length: length,
        bool: true
    };
    for (let i = 0; i <= getRandomInt(2); i++) {
        program_obj.variable.push(String.fromCharCode(97+i));
        program_obj.start.push(getRandomInt(randomValue)-10);
    }
    program_obj.end = [...program_obj.start];

    for (let i = program_obj.program_template.length; i < program_obj.length; i++) {
        program_obj.program_template.push(getRandomInt(4));
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
    }
    if(program_obj.bool){
        switch (assign_obj.variant) {
            case 0:
                program_obj.end[assign_obj.index] = assign_obj.assign;
                break;
            case 1:
                program_obj.end[assign_obj.index] += assign_obj.assign * multiplier;
                break;
            case 2:
                program_obj.end[assign_obj.index] -= assign_obj.assign * multiplier;
                break;
            default:
                break;
        }
    }
    return assign_obj;
}

function generateIf(program_obj: Program): If{
    var if_obj: If = {
        type: "if",
        variant: getRandomInt(7),
        index: getRandomInt(program_obj.variable.length),
        program: [],
        value: getRandomInt(randomValue)-10,
        bool: true,
        end: program_obj.end,
        variable: program_obj.variable
    }
    switch (if_obj.variant) {
        case 0:
            if_obj.bool = true;
            break;
        case 1:
            if_obj.bool = (program_obj.end[if_obj.index] == if_obj.value);
            break;
        case 2:
            if_obj.bool = (program_obj.end[if_obj.index] > if_obj.value);
            break;
        case 3:
            if_obj.bool = (program_obj.end[if_obj.index] >= if_obj.value);
            break;
        case 4:
            if_obj.bool = (program_obj.end[if_obj.index] < if_obj.value);
            break;
        case 5:
            if_obj.bool = (program_obj.end[if_obj.index] <= if_obj.value);
            break;
        case 6:
            if_obj.bool = (program_obj.end[if_obj.index] != if_obj.value);
            break;
    
        default:
            break;
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
        index: getRandomInt(program_obj.variable.length),
        index2: program_obj.variable.length,
        variable: [],
        program: [],
        before: [],
        end: [],
        bool: true,
        change2: getRandomInt(20)-10,
        variant: 0,
        variant2: getRandomInt(2)+1,
        multiplier: 1,
    };
    program_obj.variable.push(String.fromCharCode(97+program_obj.variable.length));
    do_obj.variable = program_obj.variable;
    program_obj.start.push(do_obj.value2);
    program_obj.end.push(do_obj.value2);
    do_obj.before = [...program_obj.end];
    do_obj.end = program_obj.end;
    if(do_obj.value > program_obj.end[do_obj.index]){
        do_obj.variant = 0;
        do_obj.multiplier = do_obj.value - program_obj.end[do_obj.index];

    } else if (do_obj.value < program_obj.end[do_obj.index]) {
        do_obj.variant = 1;
        do_obj.multiplier = program_obj.end[do_obj.index] - do_obj.value;
    } else {
        do_obj.value += 1;
        do_obj.variant = 0;
        do_obj.multiplier = do_obj.value - program_obj.end[do_obj.index];
    }
    switch (do_obj.variant) {
        case 0:
            do_obj.program.push(generateAssign(do_obj, do_obj.index, do_obj.multiplier, 1, 1));
            break;
    
        default:
            do_obj.program.push(generateAssign(do_obj, do_obj.index, do_obj.multiplier, 2, 1));
            break;
    }
    do_obj.program.push(generateAssign(do_obj, do_obj.index2, do_obj.multiplier, do_obj.variant2, do_obj.change2));
    program_obj.end = do_obj.end;
    return do_obj;
}

function getRandomInt(max:number): number{
    return Math.floor(Math.random() * max);
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
            programStr += program_obj.variable[i] + " = " + program_obj.start[i] + " ";
            programStrTemp += program_obj.variable[i] + " = " + program_obj.end[i] + " ";
            
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
            programStr += program_obj.variable[i] + " = " + program_obj.start[i] + " ";
            programStrTemp += program_obj.variable[i] + " = " + program_obj.end[i] + " ";
            
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
                programStr += parseIf(program_obj.program[i] as If);
                break;
            case "do":
                programStr += parseDo(program_obj.program[i] as Do, program_obj);
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

function parseIf(if_obj:If): string{
    let ifStr:string = "if\n\t";
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
    ifStr += "\nfi";
    return ifStr;
}


function parseDo(do_obj:Do, program_obj:Program): string{
    let doStr:string = "do";
    switch (do_obj.variant) {
        case 0:
            doStr += "[ "
            for (let i = 0; i < do_obj.before.length; i++) {
                if ( i > 0){
                    doStr += " & ";
                }
                if (i == do_obj.index){
                    doStr += do_obj.value + " >= " + do_obj.variable[i];
                }
                else if( i == do_obj.index2){
                    doStr += do_obj.variable[i] + " = " + do_obj.before[i];
                    if (do_obj.variant2 == 1){
                        doStr += " + ";
                    } else {
                        doStr += " - ";
                    }
                    doStr += do_obj.change2 + " * (" + do_obj.variable[do_obj.index] + " + " + (0-do_obj.before[do_obj.index]) + ")";
                } else {
                    doStr += do_obj.variable[i] + " = " + do_obj.before[i];
                }
            }
            for (let i = do_obj.before.length; i < program_obj.start.length; i++){
                doStr += " & " + program_obj.variable[i] + " = " + program_obj.start[i];
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
                    doStr += do_obj.variable[i] + " = " + do_obj.before[i] 
                    if (do_obj.variant2 == 1){
                        doStr += " + ";
                    } else {
                        doStr += " - ";
                    }
                    doStr += do_obj.change2 + " * (-(" + do_obj.variable[do_obj.index] + " + " + (0-do_obj.before[do_obj.index]) + "))";
                    console.log(0-do_obj.before[do_obj.index]);
                } else {
                    doStr += do_obj.variable[i] + " = " + do_obj.before[i];
                }
            }
            if (program_obj.start.length > do_obj.before.length){
                doStr += " & " + program_obj.variable[program_obj.start.length-1] + " = " + program_obj.start[program_obj.start.length-1];
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
