function capitalize(word: string) {
  const firstLetter = word[0].toUpperCase();
  const restOfTheWord = word.substring(1).toLowerCase();
  return `${firstLetter}${restOfTheWord}`;
}

export function getter(target: any, propertyKey: string) {
  const capitalizedKey = capitalize(propertyKey);
  const methodName = `get${capitalizedKey}`;
  Object.defineProperty(target, methodName, {
    value: function get() {
      return this[propertyKey];
    },
  });
}

export function setter(target: any, propertyKey: string) {
  const capitalizedKey = capitalize(propertyKey);
  const methodName = `set${capitalizedKey}`;
  Object.defineProperty(target, methodName, {
    value: function set(newValue: any) {
      this[propertyKey] = newValue;
    },
  });
}
