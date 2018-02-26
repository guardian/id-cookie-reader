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
    return atob(cookie.split('.')[0])
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


class GuCookieParser extends HTMLElement {

    constructor() {
        super();
    }

    static get observedAttributes() { return ["data-cookie","data-cookie-name"]; }

    createRow(content) {
      const $row = document.createElement('x-row');
      $row.append(content);
      $row.addEventListener('click',()=>{
        copyTextToClipboard(content)
      })
      return $row;
    }

    render(items) {
        if(!(items instanceof Array)) items = [items];

        while (this.hasChildNodes()) {
          this.removeChild(this.lastChild);
        }

        items.forEach(item => {
          this.append(this.createRow(item))
        });
    }

    async onCookie(cookie=null) {

        if(this.dataset.auto == 'false' && !cookie) {
            return this.render('🍪')
        }

        if(!cookie) {
            cookie = (await new Promise(async (yay) => {
                chrome.cookies.get({
                  url: await getCurrentTabUrl(),
                  name: this.dataset.cookieName,
              },yay)}))
              if(!cookie || !cookie.value) {
                  cookie = null;
              }
              else {
                  cookie = cookie.value;
              }
        }

        const decodedCookieAsString = getCookieAsString(cookie);
        const decodedCookieAsJSON = getCookieAsJSON(decodedCookieAsString);

        if(typeof decodedCookieAsJSON !== 'undefined') {
          return this.render([...decodedCookieAsJSON,cookie])
        }
        else if (typeof decodedCookieAsString !== 'undefined') {
          return this.render(['Invalid',decodedCookieAsString,cookie])
        }
        else if (cookie) {
          this.classList.add('error')
          return this.render(['Invalid',cookie]);
        }
        else {
          this.classList.add('error')
          return this.dataset.auto == 'false' ? this.render('Invalid cookie') : this.render('is GU_U set?');
        }

    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.onCookie(this.dataset.cookie);
    }

    connectedCallback() {
        this.onCookie(this.dataset.cookie);
    }
}



class GuAnyCookie extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback() {
        const $header = document.createElement('header');
        const $input = document.createElement('input');
        const $container = document.createElement('gu-cookie-parser');
        const $style = document.createElement('style');

        fetch('css/any-cookie.css').then(_ => _.text()).then(css => {
            $style.innerText = css;
        })

        $container.dataset.auto = false;

        $input.placeholder = 'Paste a 🍪';
        $input.autofocus = true;
        $header.append($input);
        [$header,$container,$style].forEach(_ => this.append(_));

        $input.addEventListener('keyup', ev => {
            $container.dataset.cookie = (ev.target.value);
        })
    }

}




class GuTabs extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
      this.$header = document.createElement('header');
      this.$shadow = this.attachShadow({mode:'open'});
      this.$slot = document.createElement('slot');
      this.$slot.name = 'tab';

      this.$style = document.createElement('style');

      fetch('css/tabs.css').then(_ => _.text()).then(css => {
          this.$style.innerText = css;
      })

      this.$slot.addEventListener('slotchange',()=>{
          this.onChildren([...this.$slot.assignedNodes()],this.$header);
      });

      [this.$header,this.$slot,this.$style].forEach(_ => this.$shadow.append(_))

  }

  openTab(id) {
      const $children = [...this.$slot.assignedNodes()];
      const $tabs = [...this.$header.children];

      $children.forEach(child=>
          child.setAttribute('aria-hidden',true)
      )
      $tabs.forEach(child=>
          child.setAttribute('aria-active',false)
      )
      $tabs[id].setAttribute('aria-active',true)
      $children[id].setAttribute('aria-hidden',false);
      if($children[id].querySelector('[autofocus]')) {
          $children[id].querySelector('[autofocus]').focus();
      }
  }

  onChildren($children, $header) {
      while ($header.hasChildNodes()) {
        $header.removeChild($header.lastChild);
      }
      console.log($children);
      $children.forEach((child,index) => {
          const $button = document.createElement('button');
          $button.innerText = child.dataset.tabName;
          $button.addEventListener('click',()=>{
              this.openTab(index);
          });
          $header.append($button);
      })
      this.openTab(0);
  }
}

customElements.define('gu-tabs', GuTabs);
customElements.define('gu-any-cookie', GuAnyCookie);
customElements.define('gu-cookie-parser', GuCookieParser);
