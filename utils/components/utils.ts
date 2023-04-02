/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-bitwise */

export function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== 'undefined' &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const main = (arg1: string, arg2: number, arg3?: number | null) => {
  // const obj = {arg1, arg2, arg3};
  // const res = areWellDefined(obj);
  // if (res) {
  //   const {arg1, arg2, arg3} = obj;
  // } else {
  //   const {arg1, arg2, arg3} = obj;
  // }
  // const res2 = areUndefined(obj);
  // if (res2) {
  //   const {arg1, arg2, arg3} = obj;
  // } else {
  //   const {arg1, arg2, arg3} = obj;
  // }
  // const {
  //   arg1: $arg1,
  //   arg2: $arg2,
  //   arg3: $arg3,
  // } = makeDefined({arg1, arg2, arg3});
  // const {
  //   arg1: $arg1,
  //   arg2: $arg2,
  //   arg3: $arg3,
  // } = makeUndefined({arg1, arg2, arg3});
};

export function makeDefined<T>(v: T): DoDefined<T> {
  return v as DoDefined<T>;
}

type DoDefined<T> = T extends object
  ? {
      [K in keyof T as Exclude<T[K], undefined> extends never
        ? never
        : K]: Exclude<T[K], undefined>;
    }
  : never;

export function makeUndefined<T>(v: T): AllUndefinedFields<T> {
  return v as AllUndefinedFields<T>;
}

type AllWellDefinedField<T> = T extends object
  ? {
      [K in keyof T as NonNullable<Exclude<T[K], undefined>> extends never
        ? never
        : K]: NonNullable<Exclude<T[K], undefined>>;
    }
  : never;

type AllDefinedField<T> = T extends object
  ? {
      [K in keyof T as Exclude<T[K], undefined> extends never
        ? never
        : K]: Exclude<T[K], undefined>;
    }
  : never;

type AllUndefinedFields<T> = T extends object
  ? {
      [K in keyof T as {K: undefined} extends never ? never : K]: undefined;
    }
  : never;

// @ts-ignore
export function areDefined<T extends object>(v: T): v is AllDefinedField<T> {
  return !objectKeys(v).every(k => typeof v[k] !== 'undefined');
}

export function areWellDefined<T extends object>(
  v: T,
  // @ts-ignore
): v is AllWellDefinedField<T> {
  return !objectKeys(v).every(
    k => typeof v[k] !== 'undefined' && v[k] !== null,
  );
}

export function areUndefined<T extends object>(
  v: T,
  // @ts-ignore
): v is AllUndefinedFields<T> {
  return objectKeys(v).every(k => typeof v[k] === 'undefined');
}

export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}
