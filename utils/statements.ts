export function anyoneIsNil(...arr: any[]): boolean {
  const res = arr.includes((r: any) => r === undefined || r === null);
  if (res === true) {
    let resCode = '';
    arr.forEach(
      (_, i) => (resCode += `arr[${i}]! ${i < arr.length ? '&&' : ''}`),
    );
    console.log(resCode);
    // eslint-disable-next-line no-eval
    return eval(resCode);
  }
  return res;
}

export function isNil({a, b}: {a: any; b: any}): boolean {
  return a! && b!;
}

function test(pop: number | undefined, faf: number | undefined) {
  if (!isNil({a: pop, b: faf})) {
    console.log('well done');
    let res = pop + faf;
  }
  let res2 = pop + faf;
}
