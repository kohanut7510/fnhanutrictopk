const section1 = document.getElementById('videoSection');

// Section 2 (muốn chuyển sang)
const section2 = document.getElementById('selectionSection');

if (section1 && section2) {
  section1.classList.remove('active');
  section2.classList.add('active');
}
['contextmenu','keydown','selectstart','copy'].forEach(ev => {
  document.addEventListener(ev, e => e.stopImmediatePropagation(), true);
});
const all = {};
for (const type of Object.keys(encryptedQuestionBank)) {
  all[type] = {};
  for (const diff of Object.keys(encryptedQuestionBank[type])) {
    all[type][diff] = getQuestions(type, diff);
  }
}
console.log(all);