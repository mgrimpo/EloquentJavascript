/* jshint esversion: 6 */

function verify(regex, mustMatch, mustMiss= []) {
    console.log(mustMatch);
    for (let target of mustMatch) {
        if (!regex.test(target)) throw new Error(`Target string '${target}' not matched by ${regex}`);
    }
    for (let target of mustMiss) {
        if (regex.test(target)) throw new Error(`Target string '${target}' unexpectedly matched by ${regex}`);
    }
    console.log(`The expression ${regex} matched all targets [${mustMatch}]`);
    if (mustMiss.length != 0)
        console.log(`The expression ${regex} missed all strings it should miss [${mustMiss}]`);
    console.log('\n');
}

//  1. 'car' and 'cat'
verify(/ca[tr]/,
       ['cat', 'my car'] );

// 2. 'pop' and 'prop'
verify( /pr?op/,
        ['pop', 'prop'],
        ['plop', "prrrop"]);

// 3. 'ferret', 'ferry' and 'ferrari'
verify( /ferr(y|et|ari)/,
        [ 'ferret', 'ferry' , 'ferrari' ],
        ['ferrum', 'ferrat']);

// 4. any word ending in 'ious'
verify(/\b\w+ious\b/,
    [ 'insidious', 'fallacious', 'odious'],
    ['heinous', 'piousi']);

// 5. A whitespace character followed by a period, comma, colon or semicolon
verify(/\s[.,:;]/,
    [ ' .', ' ,', '  :', '\n;'], [' ?']);

// 6. A word longer than six letters
verify(/\w{7,}/,
    ['sdfsdfsfd','sebestatat','1234567','123456789'], ['keks', 'mond','123456']);

// 7. A word without the letter e or E
verify(/\b[^\WeE]+\b/,
    ['earth platypus','roast nest','marmalada2', 'EKO frzy'], ['test bed', 'FETT']);