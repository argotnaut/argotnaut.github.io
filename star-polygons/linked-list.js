// Circular Linked List implementation
class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // Append a new node with the given value to the list
  append(value) {
    const node = new LinkedListNode(value);
    if (!this.head) {
      // First node; points to itself to form a circle
      this.head = this.tail = node;
      node.next = node;
    } else {
      // Insert node after tail and update tail
      this.tail.next = node;
      this.tail = node;
      node.next = this.head;
    }
    this.length++;
    return node;
  }
}