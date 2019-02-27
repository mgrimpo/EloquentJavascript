/* jshint  esversion : 6 */
class PGroup {
    constructor(array){
        this.members = array;
    }
    has(element) {
        return this.members.includes(element);
    }
    delete(element) {
         return new PGroup(this.members.filter(e => e != element));
    }
    add(element) {
        if (this.has(element)) return this;
        return  new PGroup(this.members.concat(element));
        
    }
  }

  PGroup.empty = new PGroup([]);
  
  let a = PGroup.empty.add("a");
  let ab = a.add("b");
  let b = ab.delete("a");
  
  console.log(b.has("b"));
  // → true
  console.log(a.has("b"));
  // → false
  console.log(b.has("a"));
  // → false