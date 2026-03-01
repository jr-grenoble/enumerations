/**
 * @fileoverview GAS enumerations.
 * 
 * @author Jean-René Bouvier (Facts Haven)
 * @copyright Jean-René Bouvier 2025-2099
 * @license {@link https://spdx.org/licenses/MIT.html|MIT}
 * @version 1.0.0
 * 
 */
;

// == ENUMERATION MODULE ==

// We use an IIFE to export only the necessary objects while allowing a flat file structure
const { enumeration, enumﾠitem, first, last, rank, index, count, stream } = (() => {

  // === ENUMERATION ACCESSORS ===

  /** 
   * #### First enumeration item ####
   * 
   * @description To avoid potential conflicts with enumeration names, we use symbols to access enumeration properties
   * such as the first element of an enumeration, or its last element, or a stream of items suitable for lazy iteration,
   * or the count of elements in the enumeration.
   * 
   * @example For an enumeration `e`, you can then get the first and last elements as `e[first]` and `e[last]`, 
   * and the number of elements as `e[count]`, while allowing the enumeration to have members with the name 
   * "first", "last", or "count" as e.first, e.last and e.count
   * (the bracket notation for these would require strings, as in e["count"]).
   * 
   * @constant {symbol}
   */
  const first = Symbol("first");
  /**
   * #### Last enumeration item ####
   * 
   * @see first
   * @constant {symbol}
   */
  const last = Symbol("last");
  /**
   * #### Access by rank ####
   * @type {symbol} 
   */
  const rank = Symbol("rank");
  /**
   * #### Access by index ####
   * @type {symbol} 
   */
  const index = Symbol("index");
  /**
   * #### Count of enumeration items ####
   * 
   * @see first
   * @constant {symbol}
   */
  const count = Symbol("count");
  /**
     * #### Lazy iterator over enumeration items ####
     * 
     * @see first
     * @constant {symbol}
     */
  const stream = Symbol("stream");

  // === ENUMERATION UTILITIES ===

  /**
   * #### Assign the index of an enumeration item ####
   * 
   * Given a name or nameￚspec (of the form "name=forcedￚindex"), add a name key to an enumeration object
   * with a value set to index (default) or forcedￚindex, and then return the offset to be added to
   * subsequent indexes.
   * 
   * @param {object} enumeration - the object to be updated 
   * @param {string} name - the enumeration item name or name-spec to be added to the `spec` object
   * @param {number} index - the index of the enumeration item, i.e. the default value for `spec.name`
   * @return {number} - an offset to be added to subsequent indexes
   * 
   */
  const assignﾠindex = (enumeration, name, index) => {
    if (typeof name !== 'string') throw Error(`enumeration item names must be strings (at index ${index}: ${json(name)})`);
    const fragment = name.split(/\s*=\s*/); // handle explicit index assignment (such as item=3)
    if (fragment.length > 2) throw Error(`cannot assign multiple indexes to enumeration items (${key})`);
    name = fragment[0];
    const forcedﾠindex = Number(fragment[1]);
    switch (true) {
      case !name:
        return 0; // tell caller to increase index offset by 1
      case Number.isInteger(forcedﾠindex):
        enumeration[name] = new enumﾠitem(name, forcedﾠindex, enumeration);
        return forcedﾠindex - index; // tell caller to shift offset by distance from forced index to natural index
      default:
        enumeration[name] = new enumﾠitem(name, index, enumeration);
        return 0; // tell caller to leave offset unchanged
    }
  }

  /**
   * #### Array to canonical spec ####
   * 
   * Updates an enumeration object by adding name or nameￚspec (of the form "name=forcedￚindex") keys with
   * incremental index values, jumping to forced indexes when these are specified.
   * 
   * @param {object} enumeration - the enumeration object to be updated 
   * @param {Array<string>} items - the names or nameￚspecs of the enumeration items
   * @param {number} [offset=0] - the index assigned to the first named item
   * @return {{ [name: string]: EnumItem }} - an object whose keys are the item names and values are the item indexes
   * 
   */
  const arrayﾠtoﾠcanonicalﾠspec = (enumeration, items, offset = 0) => Iterator.from(items).reduce(
    (enumeration, name, index) => {
      offset += assignﾠindex(enumeration, name, index + offset);
      return enumeration;
    },
    enumeration
  );

  /**
   * #### CSV string to canonical spec ####
   * 
   * Updates an enumeration object by adding name or nameￚspec (of the form "name=forcedￚindex") keys with
   * incremental index values, jumping to forced indexes when these are specified. The nameￚspecs are comma
   * separated within the csv parameter string.
   * 
   * @param {object} enumeration - the enumeration object to be updated 
   * @param {string} csv - the comma separated names or nameￚspecs
   * @return {{ [name: string]: EnumItem }} - an object whose keys are the item names and values are the item indexes
   * 
   */
  const stringﾠtoﾠcanonicalﾠspec = (enumeration, csv) => arrayﾠtoﾠcanonicalﾠspec(enumeration, csv.trim().split(/\s*,\s*/));

  /**
   * #### Object to canonical spec ####
   * 
   * Copies the argument object keys to an enumeration object and assigns incremental index values to these keys,
   * jumping to forced indexes in case the original object value is a forced index integer.
   * 
   * ⚠️ Note that object keys are inserted in the enumeration in the order of Object.keys(object);
   * 
   * @param {object} enumeration - the enumeration object to be updated 
   * @param {object} object - the object whose keys are the enumeration item names; if such a key corresponds to an integer, it is used as the item index 
   * @return {{ [name: string]: EnumItem }} - an object whose keys are the item names and values are the item indexes or forced indexes
   * 
   */
  const objectﾠtoﾠcanonicalﾠspec = (enumeration, object, offset = 0) => Object.entries(object).reduce(
    (enumeration, [name, forcedﾠindex], index) => {
      if (Number.isInteger(forcedﾠindex)) {
        offset = forcedﾠindex - index;
      }
      enumeration[name] = new enumﾠitem(name, index + offset, enumeration);
      return enumeration;
    },
    enumeration
  );

  /**
   * #### Normalize enumeration items ####
   * 
   * Handle polymorphic enumeration constructor by normalizing items
   * 
   * @param {Enumeration} enumeration - the enumeration object to be updated
   * @param {EnumSpec} items - the items passed to the enumeration constructor
   * @returns {Enumeration} - the updated enumeration object
   */
  const normalizeﾠitems = (enumeration, items) => {

    // flatten lists of items
    items = items.flat(Infinity);

    switch (items.length) {
      // +++ empty item spec +++
      case 0:
        return enumeration; // empty enumeration
      // +++ single item spec +++
      case 1:
        // ignore anything but the first item
        const item = items[0];
        switch (true) {
          // ___ CSV string or single string ___
          case typeof item === 'string':
            return stringﾠtoﾠcanonicalﾠspec(enumeration, item);
          // ___ Other primitive object item ___
          case item !== Object(item):
            throw Error(`enumeration item names must be strings (vs ${typeof item})`);
          // ___ Map item ___
          case item instanceof Map:
            return objectﾠtoﾠcanonicalﾠspec(enumeration, Object.fromEntries(item.entries()));
          // ___ Set item ___
          case item instanceof Set:
            return arrayﾠtoﾠcanonicalﾠspec(enumeration, item.keys());
          // ___ Iterable or Array item ___
          case Array.isArray(item):
          case typeof item?.[Symbol.iterator] === 'function':
            return arrayﾠtoﾠcanonicalﾠspec(enumeration, items);
          // ___ Plain object ___
          // this switch case must come last, as other non primitive objects are also object
          case typeof item === 'object':
            return objectﾠtoﾠcanonicalﾠspec(enumeration, item);
          // ___ Impossible case ___
          default: // this should never happen as we handle both primitive and non primitive objects
            throw Error(`Unsupported enums parameter (${item})`);
        }
      // +++ multiple item specs +++
      default: // we assume the items are all strings
        return arrayﾠtoﾠcanonicalﾠspec(enumeration, items);
    }
  }

  // === ENUMERATION TYPES ===

  /*
   * private symbols used to give unique names to members of enums, that cannot clash with enums members
   */
  /** @type {symbol} */
  const list = Symbol("list");
  /** @type {symbol} */
  const map = Symbol("map");

  /**
   * #### Enumeration item ####
   * 
   * @class
   * @classdesc create an enumeration item
   * 
   * @type {EnumItem}
   * @readonly
   * @memberof Enumeration
   */
  function enumﾠitem(name, index, enumeration) {
    if (!(this instanceof enumﾠitem)) return new enumﾠitem(name, index, enumeration);
    const currentﾠrank = enumeration[list].length;
    // Define non enumerable readonly properties:
    Object.freeze(
      Object.defineProperties(this, {
        enum: { value: enumeration, enumerable: true },
        name: { value: name, enumerable: true },
        index: { value: index, enumerable: true },
        rank: { value: currentﾠrank, enumerable: true },
        symbol: { value: Symbol(name), enumerable: true },
        skip: { value: function (i = 1) { return enumeration[rank][i + this.rank]; } },
        next: { get: function () { return this.skip(1); } },
        prev: { get: function () { return this.skip(-1); } },
        // alias: { get: function () { const index = this.index; let item = this.next; while (item.index !== index) item = item.next; return item; } },
        aliases: {
          get: function () {
            const index = this.index;
            const iteratorﾠfactory = () => Iterator.from(Object.values(enumeration)).filter(item => item.index === index);
            return lazyﾠindexerﾠbuilder(iteratorﾠfactory);
          }
        },
        [Symbol.toPrimitive]: { value: function (hint) { return hint === 'number' ? this.index : this.name } },
        [Symbol.toStringTag]: { get: function () { return "enum item" } },
      }));
    enumeration[list][currentﾠrank] = this;
    // ensure that [map][index] returns the first alias in insertion order
    enumeration[map].getOrInsert(index, this);
    return Object.freeze(this);
  }
  /**
   * Enumeration class
   * 
   * @class
   * @classdesc create a resettable, iterable enumeration whose members have
   * numeric indexes and unique names.
   * 
   * @example
   * // The following enumerations have members with identical names and indexes
   * const structￚenum = enumeration({first: 1, second: 2, 2048: 3, count: 3, last: 4, });
   * const arrayￚenum = enumeration([,"first", "second", 2048, "count=3", "last"]);
   * const litteralￚenum = new enumeration(,"first", "second", 2048, "count=3", "last");
   * const stringￚenum = enumeration(",first, second, 2048, count = 3,last");
   * 
   * #### overload 1
   * @constructor
   * @param {...string} items - a sequence of string
   * @return {Enumeration} - an enumeration object
   * @implements {Iterable<EnumItem>}
   *//*
‌‍  ‌ * #### overload 2
‌‍  ‌ * @constructor
‌‍  ‌ * @param {EnumSpec} items - a single object that specifies the enumeration items
‌‍  ‌ * @return {Enumeration} an enumeration object
‌‍  ‌ * @implements {Iterable<EnumItem>}
‌‍  ‌ *
‌‍  ‌ */
  function enumeration(...items) {

    // make new enumeration(…) synonymous with enumeration(…)
    if (!(this instanceof enumeration)) return new enumeration(...items);

    const itemﾠlist = []; // this is where we keep the enumeration items in a *dense*  array
    const itemﾠmap = new Map(); // this provides direct access to enum items using their indexes
    const indexﾠmap = new Proxy(itemﾠmap, {
      get(target, property) {
        const key = Number(property);
        return Number.isInteger(key) ? target.get(key) : undefined;
      }
    })

    const enums = Object.create(enumeration.prototype, {
      [Symbol.iterator]: {
        value: function* () {
          yield* this[list];
        }
      },
      [list]: { value: itemﾠlist }, 
      [map]: { value: itemﾠmap }, 

      [rank]: {
        /**
         * #### Access by insertion rank ####
         * 
         * Direct access to enums using their ranks modulo [count].
         * 
         * @param {number} i - the zero-based insertion rank of an item
         * @return {EnumItem} - the enumeration item of rank i (modulo the [count] of items)
         */
        // value: function (i) {
        //   const l = this[list];
        //   const m = l.length;
        //   return m ? l[((i % m) + m) % m] : undefined;
        // }
        get: function () { return lazyﾠindexerﾠbuilder(() => Iterator.from(this[list]), this[count]); }
      },
      [index]: {
        /**
         * #### Access by index value ####
         * 
         * @param {number} i - the index value of an item
         * @return {EnumItem|undefined} - the first enumeration item that has an index value equal to i
         * 
         */
        // value: function (i) { return this[map].get(i); }
        value: indexﾠmap
      },
      [first]: { get: function () { return this[rank][0]; } },
      [last]: { get: function () { return this[rank][-1]; } },
      [count]: {
        /**
         * return {number}
         */
        get: function () { return this[list].length; }
      },
      [stream]: {
        get: function () { return Iterator.from(this); }
      },
      [Symbol.toStringTag]: {
        get: function () { return "enumeration"; }
      },
    });

    const result = Object.freeze(normalizeﾠitems(enums, items));
    Object.freeze(result[map]);
    Object.freeze(result[list]);

    return result;
  }

  return { enumeration, enumﾠitem, first, last, rank, index, count, stream };
})();

