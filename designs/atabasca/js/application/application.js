(function () {
  'use strict';

  const userBlock = document.querySelector(`.user`);
  const userPopup = userBlock.querySelector(`.user__popup`);
  const closePopup = userBlock.querySelector(`.user__popup-close`);
  const overlay = document.querySelector(`.overlay`);

  const closePopupOnClick = (evt) => {
    // evt.preventDefault();
    userPopup.style.display = `none`;
    overlay.style.display = `none`;
    setTimeout(() => {
      userBlock.addEventListener(`click`, userOnClick);
    }, 100);
  };

  const userOnClick = () => {
    userPopup.style.display = `flex`;
    overlay.style.display = `block`;
    userBlock.removeEventListener(`click`, userOnClick);
  };

  if (userBlock) {
    userBlock.addEventListener(`click`, userOnClick);
    closePopup.addEventListener(`click`, closePopupOnClick);
    overlay.addEventListener(`click`, closePopupOnClick);
  }

  const application = document.querySelector(`.application`);
  const apps = application.querySelector(`.apps`);

  const nameParser = (nameKey) => {
    let convertedName = nameKey.replace(`_`, ` `);
    convertedName.trim();
    return convertedName.replace(convertedName[0], convertedName[0].toUpperCase());};

  const profileStringHandler = (key, value) => {
    return `<div class="profile__field">
    <div class="profile__name">${nameParser(key)}:</div>
    <div class="profile__content profile__content--long">${value}</div>
  </div>`;
  };

  const profileDateHandler = (key, value) => {
    const convertedDate = new Date(value).toUTCString();

    return `<div class="profile__field">
    <div class="profile__name">${nameParser(key)}:</div>
    <div class="profile__content">${convertedDate}</div>
  </div>`
  };

  const profileArrayHandler = (key, value) => {
    let itemsLayout = ``;
    value.forEach((item) => {
      itemsLayout += `<li class="profile__item">${item}</li>`;
    });

    return `<div class="profile__field">
    <div class="profile__name">${nameParser(key)}:</div>
    <div class="profile__content profile__content--groups profile__content--long">
      <ul class="profile__list">
        ${itemsLayout}
      </ul>
    </div>
  </div>`;
  };

  const backBtnOnClick = (profileElement) => {
    apps.style.display = `block`;
    profileElement.style.display = `none`;
  };

  const profileBtnOnClick = (dictObj) => {
    closePopupOnClick();
    apps.style.display = `none`;

    const profile = application.querySelector(`.profile`);

    if (profile) {
      profile.style.display = `flex`;
    } else {
      let profileLayout = `
      <h1 class="heading heading--h1 heading--center heading--marginBottom-15 heading--light"><span class="profile__back"><span class="profile__backIcon"></span></span>User Profile</h1>`;
    
        for (const [key, value] of Object.entries(dictObj)) {
          if (typeof value === `number`) {
            profileLayout += profileDateHandler(key, value);
          }
          if (Array.isArray(value)){
            profileLayout += profileArrayHandler(key, value);
          }
          if (typeof value === `string`) {
            profileLayout += profileStringHandler(key, value);
          }
        }  
        profileLayout += `<button class="button button--common button--marginBottom-0 button--back">Back to Applications</button>`;
    
      const profileElement = document.createElement(`div`);
      profileElement.classList.add(`profile`);
      profileElement.innerHTML = profileLayout;
      const backBtn = profileElement.querySelector(`.button--back`);
      backBtn.addEventListener(`click`, () => {
        backBtnOnClick(profileElement);
      });
      const backIcon = profileElement.querySelector(`.profile__back`);
      backIcon.addEventListener(`click`, () => {
        backBtnOnClick(profileElement);
      });
    
      application.appendChild(profileElement);
    }
  };

  window.profileBtnOnClick = profileBtnOnClick;

}());

//# sourceMappingURL=application.js.map
