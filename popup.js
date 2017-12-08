const getCurrentTabUrl = async () => {

  const queryInfo = {
    active: true,
    currentWindow: true
  };

  return new Promise((yay,nay)=>{
    chrome.tabs.query(queryInfo, (tabs) =>
      yay(tabs[0].url)
    );
  });

}

const getCookieAsString = (cookie) => {
  try {
    return atob(cookie.value.split('.')[0])
  } catch(e) {
    return undefined;
  }
}

const getCookieAsJSON = (cookie) => {
  try {
    return JSON.parse(cookie).filter(txt => txt.toString().length > 0);
  } catch(e) {
    return undefined;
  }
}

const action = async () => {

  const url = await getCurrentTabUrl();

  chrome.cookies.get({
    url,
    name: 'GU_U',
  },(cookie)=>{

    const decodedCookieAsString = getCookieAsString(cookie);
    const decodedCookieAsJSON = getCookieAsJSON(decodedCookieAsString);

    if(typeof decodedCookieAsJSON !== 'undefined') {
      document.querySelector('section').innerHTML = decodedCookieAsJSON.join('<hr/>')
    }
    else if (typeof decodedCookieAsString !== 'undefined') {
      document.querySelector('section').innerHTML = decodedCookieAsString
    }
    else if (cookie && cookie.value) {
      document.querySelector('section').classList.add('error')
      document.querySelector('section').innerHTML = cookie.value;
    }
    else {
      document.querySelector('section').classList.add('error')
      document.querySelector('section').innerHTML = 'is GU_U set?';
    }
  });

}

document.addEventListener('DOMContentLoaded', async () => {
  action();
});
