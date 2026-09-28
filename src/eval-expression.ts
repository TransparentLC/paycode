/**
 * 格式化和计算由数值、四则运算和括号组成的表达式
 *
 * 参见：[数据结构——中缀转后缀表达式 - 王陸 - 博客园](https://www.cnblogs.com/wkfvawl/p/12864789.html)
 *
 * @param expr 表达式
 * @returns 格式化后的表达式和计算结果
 */
const evalExpression = (expr: string) => {
    // 一个数值或者运算符是一个 token，按顺序给出
    const tks = [] as ('+' | '-' | '*' | '/' | '(' | ')' | number)[];
    // 中缀转后缀表达式的符号栈
    const ops = [] as ('+' | '-' | '*' | '/' | '(')[];
    // 转换出的后缀表达式
    const exs = [] as ('+' | '-' | '*' | '/' | number)[];
    let m: RegExpMatchArray | null;

    while (expr) {
        // 尝试解析数值
        m = expr.match(/^-?(?:\.?\d+|\d+\.\d*)/);
        if (m) {
            const n = parseFloat(m[0])
            tks.push(n);
            exs.push(n);
            expr = expr.substring(m[0].length);
            continue;
        }
        // 处理运算符
        const op = expr[0];
        switch (op) {
            // 忽略空格
            case ' ':
                break;
            // 左括号：直接入栈
            case '(':
                ops.push(op);
                break;
            // 右括号：出栈和输出到栈顶是左括号为止，左括号不输出
            case ')':
                while (ops.length && ops[ops.length - 1] !== '(') {
                    exs.push(ops.pop() as ('+' | '-' | '*' | '/'));
                }
                if (ops.length && ops[ops.length - 1] === '(') {
                    ops.pop();
                }
                break;
            // 运算符：出栈和输出到栈顶是左括号或更低优先级运算符为止，然后当前运算符入栈
            case '*':
            case '/':
                while (ops.length && ops[ops.length - 1] !== '(' && ops[ops.length - 1] !== '+' && ops[ops.length - 1] !== '-') {
                    exs.push(ops.pop() as ('*' | '/'));
                }
                ops.push(op);
                break;
            case '+':
            case '-':
                while (ops.length && ops[ops.length - 1] !== '(') {
                    exs.push(ops.pop() as ('+' | '-' | '*' | '/'));
                }
                ops.push(op);
                break;
            default:
                throw new Error(`Unexpected token in expression: ${expr}`);
        }
        if (op !== ' ') {
            tks.push(op);
        }
        expr = expr.substring(1);
    }
    // 符号栈中还有左括号说明括号不平衡
    if (ops.includes('(')) throw new Error('Unbalanced brackets');
    // 出栈和输出剩余符号
    while (ops.length) {
        exs.push(ops.pop() as ('+' | '-' | '*' | '/'));
    }

    // 输出格式化后的表达式
    // 运算符和数值之间有空格，连续的括号中间没有空格
    let formatted = '';
    for (let i = 0; i < tks.length; i++) {
        if (typeof tks[i] === 'number') {
            formatted += tks[i].toString();
        } else {
            switch (tks[i]) {
                case '+':
                case '-':
                case '*':
                case '/':
                    formatted += ` ${tks[i]} `;
                    break;
                case '(':
                    formatted += `${i === 0 || tks[i - 1] !== '(' ? '' : ' '}${tks[i]}`;
                    break;
                case ')':
                    formatted += `${tks[i]}${i === tks.length - 1 || tks[i + 1] !== ')' ? '' : ' '}`;
                    break;
            }
        }
    }

    // 后缀表达式求值
    const evs = [] as ('+' | '-' | '*' | '/' | number)[];
    for (const e of exs) {
        if (typeof e === 'number') {
            evs.push(e);
        } else {
            const b = evs.pop() as number;
            const a = evs.pop() as number;
            switch (e) {
                case '+':
                    evs.push(a + b);
                    break;
                case '-':
                    evs.push(a - b);
                    break;
                case '*':
                    evs.push(a * b);
                    break;
                case '/':
                    evs.push(a / b);
                    break;
            }
        }
    }
    return [formatted, evs.pop()] as [string, number];
};

export default evalExpression;
