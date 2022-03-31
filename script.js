'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2022-03-27T18:49:59.371Z',
    '2022-03-29T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// **************Functions**************

const formatDateMov = function (locale, date) {
  const calcDays = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDays(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed < 7) return `${daysPassed} days ago`;
  else {
    // const year = date.getFullYear();
    // const month = `${date.getMonth()}`.padStart(2, 0);
    // const day = `${date.getDate()}`.padStart(2, 0);

    return Intl.DateTimeFormat(locale).format(date);
  }
};

// formatting currencies
const formattedCurr = function (value, local, curr) {
  const option = { style: 'currency', currency: curr };
  return new Intl.NumberFormat(local, option).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    // format curr movement
    const formattedMov = formattedCurr(mov, acc.local, acc.currency);

    // display date of movements
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatDateMov(acc.locale, date);

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date"> ${displayDate} </div>
          <div class="movements__value">${formattedMov}</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalanceMov = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formattedCurr(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

// computing userName
const createUserNames = function (accs) {
  accs.forEach(account => {
    account.userName = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUserNames(accounts);
// console.log(accounts);

const calcDisplaySummery = function (acc) {
  // display income
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formattedCurr(incomes, acc.locale, acc.currency);
  // display outcome
  const outcome = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formattedCurr(outcome, acc.locale, acc.currency);
  //  display interest
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = formattedCurr(
    interest,
    acc.locale,
    acc.currency
  );
};

// timer

const startTimerLogOut = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };

  let time = 500;
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

let currentAccount, timer;
const updateUI = function (currentAccount) {
  //display movement
  displayMovements(currentAccount);

  // display balance
  displayBalanceMov(currentAccount);

  // display summery
  calcDisplaySummery(currentAccount);
};
// adding event listener
btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );

  console.log(currentAccount);
  if (currentAccount.pin == +inputLoginPin.value) {
    // display UI of welcome/////////////////////
    labelWelcome.textContent = `welcome, ${
      currentAccount.owner.split(' ')[0]
    } `;
    containerApp.style.opacity = 100;

    const now = new Date();
    // // // internationalizing dates
    // const locale = navigator.language;
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // create current date and time
    // const now = new Date();
    // const year = now.getFullYear();
    // const month = `${now.getMonth()}`.padStart(2, 0);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const hours = now.getHours();
    // const min = now.getMinutes();

    // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${min}`;

    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startTimerLogOut();
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const reciverAcc = accounts.find(
    acc => inputTransferTo.value == acc.userName
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    amount <= currentAccount.balance &&
    reciverAcc &&
    reciverAcc?.userName !== currentAccount.userName
  ) {
    // add amounts to movements
    currentAccount.movements.push(-amount);
    reciverAcc.movements.push(amount);
    // add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    reciverAcc.movementsDates.push(new Date().toISOString());
    startTimerLogOut();
    updateUI(currentAccount);
    // Reset timer
    clearInterval(timer);
    timer = startTimerLogOut();

    // if (timer) clearInterval(timer);
    // timer = startTimerLogOut();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  setTimeout(function () {
    if (
      amount > 0 &&
      currentAccount.movements.some(mov => mov >= amount * 0.1)
    ) {
      // add movements
      currentAccount.movements.push(amount);
      // add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
      clearInterval(timer);
      timer = startTimerLogOut();
    }
  }, 2500);
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.userName &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName == currentAccount.userName
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
