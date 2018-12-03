const L2R = 1;
var isImplicit = false;
var raw = "";
var x = 0;
var y = 0;
var exp;
var postfix = [];
var i;
function isVariable(ch){
	return (ch == 'x' || (isImplicit &&  ch == 'y'));
}
function isNum(n){
	return n >= "0" && n <= "9";
}
function isAlpha(n){
	return n >= "a" && n <= "z";
}
function extractNum(ex){													//extracts number from ex from character position i
	var n = "";
	var c = 0;
	while(i < ex.length && (isNum(ex[i]) || ex[i] == "." )) {
		if(ex[i] == ".")
			c++;
		n += ex.charAt( i++ );
	}
	if(c > 1)																//if multiple decimals are encountered throw error
		throw "Invalid Expression";
	i--;
	return n;
	
}
function extractFunc(ex){													//extracts function from ex from character position i
	var fun = "";
	while( i < ex.length && (isAlpha(ex.charAt(i)) || isNum(ex.charAt(i))))
		fun += ex.charAt(i++);
	i--;
	return fun;
}
function assoc(op){															//returns associativity of op
	if(op != '^')
		return L2R;
	return 0;
}
function checkBraces(ex){
	var c = 0;
	for(var j = 0; j < ex.length; j++){
		if(ex.charAt(j) == "(")
			c++;
		else if(ex.charAt(j) == ")")
			c--;
		if(c < 0)						//if there are more close of paranthesis than opening
			break;
	}
	if(c != 0)
		throw "Invalid Placement of Braces";
}
function reduceEx(exp_raw){
	var ex = "";
	var nBraces = 0;
	var currch, ch;
	var onGoingOp = false, nestedInFunc = 0, nestedInUnary = 0;
	var tmp = [];
	var top = -1;
	var op;
	do{
		currch = exp_raw.charAt(i);
		if(isNum(currch)){															//if first character of token is num then treat token as number
			ex = extractNum(exp_raw);
			if((!onGoingOp && !nestedInFunc && tmp[top] != '(') || tmp[top] == ')')	//if previos tokrn was ')' or is a number then add '*'
				tmp[++top] = "*";													
			tmp[++top] = ex;														//add token at top
			while(nestedInUnary){													//close all open of braces done for Unary op encountered
				tmp[++top] = ')';
				nestedInUnary--;
			}
			while(nestedInFunc){													//close all open of braces done for functions encountered
				tmp[++top] = ")";
				nestedInFunc--;
			}
			onGoingOp = false;
		}
		else if(isAlpha(currch)){													//if first character is an Alpha then token can either be Funtion or a variable
			ex = extractFunc(exp_raw);
			if((!onGoingOp && !nestedInFunc && tmp[top] != '(') || tmp[top] == ')')	//same as in case Num
					tmp[++top] = "*";
			if(isVariable(ex)){
				tmp[++top] = ex;
				while(nestedInUnary){
					tmp[++top] = ')';
					nestedInUnary--;
				}
				while(nestedInFunc){
					tmp[++top] = ")";
					nestedInFunc--;				
				}
				onGoingOp = false;
			}
			else{																	//if it is function add it followed by '('
				nestedInFunc++;
				tmp[++top] = ex;
				tmp[++top] = "("; 
				onGoingOp = false;
			}
		}
		else if(currch == '('){
			if(top != -1 && (tmp[top] == ')' || isNum((tmp[top]).charAt(0)) || isVariable(tmp[top])))
				tmp[++top] = '*';
			if(nBraces != 0){														//if it is not the first open bracket
				ex = reduceEx(exp_raw);												//use recursion to reduce expresion within this open of braces and correspoding close
				i--;
				if(nestedInFunc){
					top--;
					nestedInFunc--;
				}
				for(var k = 0; k < ex.length; k++)
					tmp[++top] = ex[k];
				onGoingOp = false;
			}
			else{
				tmp[++top] = currch;
				nBraces++;
				onGoingOp = false;
			}
		}
		else if(currch == ")"){
			tmp[++top] = currch;
			nBraces--;
			while(nestedInUnary){
				tmp[++top] = ')';
				nestedInUnary--;
			}
			while(nestedInFunc){
				tmp[++top] = ")";
				nestedInFunc--;				
			}
			if(onGoingOp){														//if there happened to be an opretor just before ')' then throw error
				throw "Invalid Expression";
			}
			onGoingOp = false;
		}
		else if(!(isNum(currch) || isAlpha(currch)) && currch != " "){
			if(onGoingOp || tmp[top] == '('){									//if an operator is followed by another except '('
				if(precedence(currch) == 0){									//if current operator is + or - then it is unary
					tmp[++top] ='(';
					tmp[++top] = '0';
					nestedInUnary++;
				}
				else{
					throw "Invalid Expression";
				}
			}
			tmp[++top] = currch;
			onGoingOp = true;
		}
		i++;
	}while(nBraces != 0);														//exit when corresponding close of braces is found
	return tmp;
}
function precedence(opr){														//returns precedence of opr
	var a = -1;
	if(opr === '+' || opr ==='-')
		a = 0;
	else if(opr === '*' || opr === '/')
		a = 1;
	else if(opr === '(' || opr === ')')
		a = 3;
	else if(opr == '^')
		a = 2;
	else if(opr == ',')
		a = 4;
	else if(isAlpha(opr.charAt(0)))												//functions have highest precedence
		a = 10;
	else{
		throw "Invalid Operator";
	}
	return a;
}
function orderOfOp(op1,op2){													//returns 1 if op1 should be switched with op2 while converting to postfix
	if(precedence(op1) > precedence(op2))
		return 1;
	if(precedence(op1) == precedence(op2) && assoc(op1) == L2R)
		return 1;
	return 0;	
}
function parse(){
	var op = [];
	var l = 0, j = -1;
	for (i = 0; i < exp.length; i++){
		if (isAlpha(exp[i].charAt(0))){
			var string = exp[i];
			if(isVariable(string))								//if it is variable then push in postfix
				postfix[l++] = string;							
			else
				op[++j] = string;								//else it is a function so push in operator stack
		}		
		else if(isNum(exp[i].charAt(0))){						//same as in case of variable
			postfix[l++] = exp[i];
		}
		else if(exp[i] == '(')									
				op[++j] = '(';
		else if(exp[i] == ')'){									//if close bracket then pop all operators to postfix till first open bracket
			while (op[j] != '(')
				postfix[l++] = op[j--];
			j--;
		}
		else if(exp[i] == ','){
			while(op[j] != '(')
				postfix[l++] = op[j--];		
		}
		else{
			while(j != -1 && op[j]!='(' && orderOfOp(op[j],exp[i]))	//popping operators from op to postfix if they need to be switched
				postfix[l++] = op[j--];
			op[++j] = exp[i];
		}
	}
	while(j != -1)													//popping all remaining operators
		postfix[l++] = op[j--];
}
function UnBiTe(ch){												//returns the number of parameters a function a can
	if(ch == "logn")
		return 2;
	return 1;
}
function eval(ob){
	var val;
	if(ob.func == '+')
		val = ob.val1 + ob.val2;
	else if(ob.func == '-')
		val = ob.val1 - ob.val2;
	else if(ob.func == '*')
		val = ob.val1 * ob.val2;
	else if(ob.func == '/')
		val = ob.val1 / ob.val2;
	else if(ob.func == '^')
		val = Math.pow(ob.val1,ob.val2);
	else if(ob.func == "sin")
		val = Math.sin(ob.val1);
	else if(ob.func == "cos")
		val = Math.cos(ob.val2);
	else if(ob.func == "tan")
		val = Math.tan(ob.val1);
	else if(ob.func == "exp")
		val = Math.exp(ob.val1);
	else if(ob.func == "logn")
		val = Math.log(ob.val1)/Math.log(ob.val2);
	else if(ob.func == "loge")
		val = Math.log(ob.val1);
	else if(ob.func == "floor")
	    {
        val = Math.floor(ob.val1);
        if (Math.floor(ob.val1+0.1)>Math.floor(ob.val1))
           val = NaN;
		}
    else if (ob.func=="ceil")
	{
	    val = Math.ceil(ob.val1);
		if (Math.floor(ob.val1+0.03)!=Math.floor(ob.val1))
           val = NaN;
		}
    else if (ob.func=="sqrt")
	    val = Math.sqrt(ob.val1);
    else if(ob.func=="pow")
	    val = Math.pow(ob.val1, ob.val2);
	else if(ob.func == "asin")
	    val = Math.asin(ob.val1);
	else if(ob.func == "acos")
	    val = Math.acos(ob.val1);
	else if(ob.func == "atan")
	    val = Math.atan(ob.val1);
	else if(ob.func == "cosec")
	    val = 1/Math.sin(ob.val1);
    else if (ob.func == "sec")
	    val = 1/ Math.cos(ob.val1);
	else if(ob.func == "cot")
	    val = 1/Math.tan(ob.val1);
	else
		throw "Unidentified Fuction";
	return val;
}
function evaluate(x, y = 0){
	var value = [];
	var ch;
	var j = -1;
	for (var k = 0; k < postfix.length; k++){
		ch = postfix[k];
		if(ch == 'x')													//if token is a variable of a number simply push to output stack
			value[++j] = x;
		else if(isImplicit && ch == 'y')
			value[++j] = y;
		else if(isNum(ch.charAt(0))){
			value[++j] = parseFloat(ch);
		}
		else if(!(isNum(ch) || isAlpha(ch))){							//if token is operator or function then take as many parameters as it requires
			value [j-1] = eval({func:ch ,val1:value[j-1], val2:value[j]});//then operate on it and replace those with their value in output stack
			j--;
		}
		else if(isAlpha(ch.charAt(0))){
			switch(UnBiTe(ch)){
				case 1: value[j] = eval({func:ch, val1:value[j]});
						break;
				case 2: value[j-1] = eval({func: ch, val1:value[j-1], val2: value[j]});
						j--;
						break;
			}
		}
	}
	if(j != 0)															//if more than one character left in stack then more or less paramaters were passed to a function 
		throw "Invalid Expression";
	return value[0];
}
function checkFunc(ex){													//also checks if each function is given right no. of parameters
	var c, d;
	for(var j = 0; j < ex.length; j++){
		if(isAlpha(ex[j].charAt(0)) && !isVariable(ex[j])){
			c = 0;
			d = 0;
			for(var k = j + 1; k < ex.length; k++){
				if(ex[k] == '(')
					c++;
				else if(ex[k] == ')')
					c--;
				else if(c == 1 && ex[k] == ',')
					d++;											//only count ',' if it is outside any compound statement
				else if(d == 0){
					d = 1;
				}
				if(c == 0)
					break;
			}
			if(d != UnBiTe(ex[j]))
				throw "Invalid Number of Parameters";
		}
	}

}
function checkForY(){
	for(var j = 0; j < exp.length; j++)
		if(exp[j] == 'y')
			return 1;
	return 0;
}
function set(exp_raw, isimplicit){
	isImplicit = isimplicit;												//sets parser to the expression passed
	raw = ("(" + exp_raw + ")").toLowerCase() + '\0';
	checkBraces(raw);
	i = 0;
	exp = [];
	exp = reduceEx(raw);
	checkFunc(exp);
	if(isImplicit)
		if(!checkForY())
			throw "Invalid Implicit Expression";
	i = 0;
	postfix = [];
	parse();
}
/*code for finding roots of an implicit equation by a variant of secant method*/
var close;
var count = 100;
var range = {yL:10,yR:10};
var interval;
function setValues(){									//sets values of parameters from parameters inou Plotter.js
	interval = precision;
	close = precision/10;
	range.yL = bound.y.L - (bound.y.U - bound.y.L)/2;
	range.yR = bound.y.U + (bound.y.U - bound.y.L)/2;
}
function findY(x){										//returns values of y corresponding to x such that exp = 0 
	var yl, yr, fyl, fyr;
	yl = range.yL;
	var Y = [];
	var l = 0;
	fyl = evaluate(x, yl);
	while(Math.abs(fyl) < close){						//if yl is itself a root then push to Y
		Y[l++] = yl;
		yl += interval;
		fyl = evaluate(x, yl);
	}
	for(yr = yl + interval; yr <= range.yR; yr += interval){
		fyr = evaluate(x, yr);
			if(Math.abs(fyr) < close){							//if yr is itself a root
				Y[l++] = yr;
				yl = yr + interval;
				yr = yr + interval;
				fyl = evaluate(x, yl);
			}
			else{
				if(!isNaN(fyr) && !isNaN(fyl))
					if(fyr * fyl < 0){								//if this is true then there must lie a root between yl and yr
						var t = secantMethod(x, yl, yr);
						Y[l++] = t;
					}
				yl = yr;
				fyl = fyr;
			}
				
	}
	return Y;
}
function secantMethod(x, y1, y2){
	var fy1 = evaluate(x, y1);
	var fy2 = evaluate(x, y2);
	var y3, fy3;
	for(var j = 0; j < count; j++){								//to preventing it from running into an infinite loop
		y3 = y1 - fy1 * (y2 - y1) / (fy2 - fy1);				//y3 found by drawing secant between y1 and y2 and finding its point of intersection with y axis
		fy3 = evaluate(x, y3);
		if(Math.abs(fy3) < close)
			return y3;
		else if(fy3 * fy1 < 0){									//if this is true then root will lie between y3 and y1 else between y3 and y2
			y2 = y3;
			fy2 = fy3;
		}
		else{
			y1 = y3;
			fy1 = fy3;
		}
	}
	return NaN;
}