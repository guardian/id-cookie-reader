const copyTextToClipboard = (text) => {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}


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

const createRow = (content) => {
  const $row = document.createElement('x-row');
  $row.append(content);
  $row.addEventListener('click',()=>{
    copyTextToClipboard(content)
  })
  return $row;
}

const render = async (items) => {
  if(!(items instanceof Array)) items = [items];
  const $section = document.querySelector('section');

  $section.innerHtml = '';

  items.forEach(item => {
    $section.append(createRow(item))
  });
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
      return render(decodedCookieAsJSON)
    }
    else if (typeof decodedCookieAsString !== 'undefined') {
      return render([decodedCookieAsString,cookie.value])
    }
    else if (cookie && cookie.value) {
      document.querySelector('section').classList.add('error')
      return render(cookie.value);
    }
    else {
      document.querySelector('section').classList.add('error')
      return render('is GU_U set?');
    }
  });

}

document.addEventListener('DOMContentLoaded', async () => {
  action();
});
