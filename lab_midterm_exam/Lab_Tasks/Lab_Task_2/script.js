const form = document.getElementById('checkoutForm');
const successMessage = document.getElementById('successMessage');


['phone', 'card', 'cvv'].forEach(id => {
  document.getElementById(id).addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });
});


const expiryInput = document.getElementById('expiry');
expiryInput.addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '');
  if (val.length >= 3) {
    this.value = val.slice(0, 2) + '/' + val.slice(2, 4);
  } else {
    this.value = val;
  }
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  let valid = true;
  successMessage.textContent = "";


  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  const card = document.getElementById('card');
  const expiry = document.getElementById('expiry');
  const cvv = document.getElementById('cvv');


  const showError = (input, errorId, condition) => {
    const error = document.getElementById(errorId);
    if (condition) {
      input.classList.add("invalid");
      error.style.display = "block";
      valid = false;
    } else {
      input.classList.remove("invalid");
      error.style.display = "none";
    }
  };

  showError(name, 'nameError', !/^[A-Za-z\s]+$/.test(name.value.trim()));
  showError(email, 'emailError', !/^[^\s@]+@[^\s@]+\.com$/.test(email.value.trim()));
  showError(phone, 'phoneError', phone.value.length !== 11);
  showError(address, 'addressError', address.value.trim() === '');
  showError(card, 'cardError', card.value.length !== 16);
  showError(cvv, 'cvvError', cvv.value.length !== 3);


  const expMatch = expiry.value.match(/^(\d{2})\/(\d{2})$/);
  let expValid = true;
  if (!expMatch) {
    expValid = false;
  } else {
    const [ , mm, yy ] = expMatch;
    const month = parseInt(mm);
    const year = parseInt("20" + yy);
    const now = new Date();
    const expDate = new Date(year, month - 1);
    const current = new Date(now.getFullYear(), now.getMonth());

    if (month < 1 || month > 12 || expDate < current) {
      expValid = false;
    }
  }
  showError(expiry, 'expiryError', !expValid);

  if (valid) {
    successMessage.textContent = "Form submitted successfully!";
    form.reset();
    document.querySelectorAll("input").forEach(i => i.classList.remove("invalid"));
    document.querySelectorAll(".error-message").forEach(e => e.style.display = "none");
  }
});
