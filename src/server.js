process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.text());
app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
  });


  app.post('/', function (req, res) {
     let arg = req.body.split(',');
      GoToRedeemCode(arg[0],arg[1],arg[2],arg[3],arg[4]).catch(err=>console.log(err))
  });

  const findEmailCode = async (codeFoo,usernameGmail,passGmail) => {
      console.log('findCode')
    var Imap = require('imap'),
        inspect = require('util').inspect;

    let isCode = '';

    var imap = new Imap({
        user: usernameGmail,
        password: passGmail,
        host: 'imap.gmail.com',
        port: 993,
        tls: true
    });

    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }

    var buffer = '';
    let numOfChank = 0;
    imap.connect();
    
    
      imap.once('ready', function () {
        openInbox(function (err, box) {
            if (err) throw err;
            var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM)', 'TEXT'] });
            f.on('message', function (msg) {
               //  console.log('on-message')
                msg.on('body', function getCode(stream, info) {
                   //  console.log('on-body')

                    stream.on('data', function (chunk) {
                        // console.log('on-data')
                        if (numOfChank < 2) {
                            buffer += chunk.toString('utf8');
                           //  console.log(12412412412,buffer)
                        }
                        numOfChank++;
                       // console.log(numOfChank)
                    });
                    let code = '';
                    //parse code from email
                    for (let i = 0; i <= buffer.length; i++) {
                        if (+buffer[i] >= 0) code += `${buffer[i]}`
                        else code = ''
                        if (code.length === 6) {
                            if (buffer[i + 1] === '=') isCode = code;
                            else code = '';
                        }
                    }
                    codeFoo.value = isCode
                   // console.log(isCode)
                });
            });
            f.once('error', function (err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function () {    
                console.log('Done fetching all messages!');
                imap.end();
                
            });
        });
        
    })
    
}

  async function GoToRedeemCode(usernameLolz,passLolz,usernameGmail,passGmail,maxPrice) {
    const puppeteer = require('puppeteer');
    // Import module
    const Client = require('@infosimples/node_two_captcha');
    
    // Declare your client
   const client2Captcha = new Client('81bc1726d052e1f714ae5236dc5a9799', {
        timeout: 60000,
        polling: 5000,
        throwErrors: false
    });
    
    const emailCode = {
        value: ""
    };

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless:false, defaultViewport:null, slowMo: 1});
    const page = await browser.newPage();

    let done;
    let countOfAcc = 0;
    await page.waitFor(1000)
    await page.goto('https://lolz.guru/market/vkontakte/?origin[]=brute&origin[]=stealer&origin[]=fishing&vk_friend_min=19&order_by=price_to_up');
    await page.waitForSelector('#navigation > div.pageContent > nav > div > div > a.button.OverlayTrigger.primary.login-and-signup-btn');
    // click login button 
    await page.click('#navigation > div.pageContent > nav > div > div > a.button.OverlayTrigger.primary.login-and-signup-btn');
    await page.waitForSelector('#ctrl_pageLogin_password');
    await page.waitFor(1000);
    //enter the login
    await page.type('#ctrl_pageLogin_login', usernameLolz);
    //enter the pass
    await page.waitFor(1000);
    await page.type('#ctrl_pageLogin_password', passLolz);
    await page.waitFor(1000);
    await page.click('#pageLogin > div.loginForm--bottomBar > input');
    await page.waitForSelector('#ctrl_email_code');
    const isCode = await page.$('#ctrl_email_code');
    if (isCode) {
        await page.waitFor(5000)
        //give var by reference
        await findEmailCode(emailCode,usernameGmail,passGmail).catch((err)=>console.log(err))
        await page.waitFor(2000)
        await page.type('#ctrl_email_code', emailCode.value);
        await page.waitFor(1000);
        await page.click('#content > div > div > form > div:nth-child(5) > input');
        await page.waitForSelector('#NavigationAccountUsername');
    }
    let times = 0;
    while (!done) {
        times++;
        let complete = false;
        let num = 4;
        let username = '+37121534332';
        let password = 'kTVrZBq3';
        let pageNum = 1;
        console.log('while starded!')

        if (times > 1) {
            await page.goto(`https://lolz.guru/market/vkontakte/?origin[]=brute&origin[]=stealer&origin[]=fishing&vk_friend_min=19&order_by=price_to_up`);
            await page.waitForSelector('#NavigationAccountUsername');
        }


        while (!complete) {
            const itemsNum = await page.evaluate(() => {
                return document.querySelectorAll("div[id^='marketItem--']").length;
            })
            // console.log(itemsNum)
            //choose an account
            await page.waitFor(1000)
            await page.click(`.marketIndexItem:nth-child(${num}) > div.marketIndexItem--topContainer > a`);
            // console.log(num, ' num')
            num++;
            await page.waitForSelector('#content > div > div > div > div > div.market--titleBar.market--spec--titleBar > div.marketItemView--title > h1')
            //check buy button
            const price = await page.evaluate(()=>{
                return document.querySelector('#content > div > div > div > div > div.market--titleBar.market--spec--titleBar > div.marketItemView--title > div > div > span > span.value').innerText;
            })
            if(+price > +maxPrice) {
                console.log(+price,+maxPrice);
                pageNum = 1;
                num = 4;
                await page.goto(`https://lolz.guru/market/vkontakte/?origin[]=brute&origin[]=stealer&origin[]=fishing&vk_friend_min=19&order_by=price_to_up&page=${pageNum}`)
                continue
            }
            const checkAvailability = await page.$('#content > div > div > div > div > div.market--titleBar.market--spec--titleBar > div.mn-30-0-0 > a.button.primary.OverlayTrigger.marketViewItem--buyButton');
            if (checkAvailability) {
                console.log('buy is availability')
                //click buy
                page.waitFor(1000)
                await page.click('#content > div > div > div > div > div.market--titleBar.market--spec--titleBar > div.mn-30-0-0 > a.button.primary.OverlayTrigger.marketViewItem--buyButton')
                //check buy
                await page.waitFor(10000);
                const isSuch = await page.$('#content > div > div > div > div > div.market--titleBar.market--spec--titleBar > div.marketItemView--loginData.mn-30-0-0')
                if (isSuch) {
                    console.log('buy is sucefull!')
                    const userData = await page.evaluate(() => {
                        const login = document.querySelector('#loginData--login').innerText;
                        const pass = document.querySelector('#loginData--password').innerText;
                        return {
                            login: login,
                            pass: pass
                        }
                    })
                    username = userData.login;
                    password = userData.pass;
                    complete = true;
                }
            }
            if (num === itemsNum) {
                pageNum++;
                num = 1;
            }
            // console.log(pageNum)
          //  complete = true;
            await page.waitFor(1000)
            await page.goto(`https://lolz.guru/market/vkontakte/?origin[]=brute&origin[]=stealer&origin[]=fishing&vk_friend_min=19&order_by=price_to_up&page=${pageNum}`);
        }
        await page.waitFor(1000)
        //go to dragonmaney
        await page.goto('https://drgn.gold/landing');
        await page.waitForSelector('#app > div.landing-container > div.landing > div.header-container > div > a > button');

        //click Start the game
        await page.click('#app > div.landing-container > div.landing > div.header-container > div > a > button');
        await page.waitForSelector('#install_allow');

        await page.type('#login_submit > div > div > input:nth-child(7)', username);
        //enter a pass
        await page.waitFor(1000);
        await page.type('#login_submit > div > div > input:nth-child(9)', password);
        //click login button
        await page.waitFor(1000);
        await page.click('#install_allow');
        await page.waitFor(2000)
        let isCap = await page.$('.oauth_captcha')
        while (isCap) {
            const imgUrl = await page.evaluate(() => {
                return document.querySelector('#login_submit > div > div > img').src;
            })
            let answer = '';
            const tryToSolveCaptcha = async () => {
                await client2Captcha.decode({
                    url: imgUrl
                }).then(function (response) {
                    console.log(response.text);
                    answer = response.text;
                });
            }
            await tryToSolveCaptcha();
            await page.waitFor(1000);
            await page.type('#login_submit > div > div > input:nth-child(9)', password);
            await page.waitFor(1000);
            await page.type('#login_submit > div > div > input:nth-child(13)', answer);
            await page.waitFor(1000);
            await page.click('#install_allow');
            await page.waitFor(2000);
            isCap = await page.$('.oauth_captcha')

        }
        await page.waitFor(4000);
        const isValid = await page.$('#login_submit > div > div.box_error')
        if (isValid) {
            console.log('login is not valid')
            continue
        };
        const isAllowButton = await page.$('#oauth_wrap_content > div.oauth_bottom_wrap > div > div.fl_r > button.flat_button.fl_r.button_indent');
        if (isAllowButton) {
            console.log('allow')
            await page.click('#oauth_wrap_content > div.oauth_bottom_wrap > div > div.fl_r > button.flat_button.fl_r.button_indent');
            await page.waitFor(5000)
        }
        const isBlocked = await page.$('.PageBlock');
        if (isBlocked) {
            await page.click('#mhead > div > a');
            await page.waitFor(2000)
            console.log('Account is blocked')
            continue
        }
        page.waitForSelector('#app > div.layout > aside > a > img')
        //go to referals
        await page.goto('https://drgn.gold/referals');
        await page.waitForSelector('#app > div.layout > div.content > div.content-inner > div > div.info-cards > div:nth-child(5) > form > button')
        //enter a code
        await page.waitFor(1000);
        await page.type('#app > div.layout > div.content > div.content-inner > div > div.info-cards > div:nth-child(5) > form > label > div > input', 'ind');
        await page.waitFor(1000);
        await page.click('#app > div.layout > div.content > div.content-inner > div > div.info-cards > div:nth-child(5) > form > button');
        //exit from dm
        await page.waitFor(1000);
        await page.click('#app > div.layout > div > div.wrapper.nav-bar.visible > div.user > svg');
        await page.waitFor(600);
        //exit from vk
        await page.goto('https://vk.com/');
        await page.waitForSelector('#l_pr');
        const isContinuePopupButton = await page.$('#vkconnect_continue_button');
        if (isContinuePopupButton) await page.click('#vkconnect_continue_button');
        const isNotificationPopup = await page.$('.PushNotifierPopup__close-button');
        if (isNotificationPopup) await page.click('.PushNotifierPopup__close-button');
        const isBindEmailButton = await page.$('#bindmail_button');
        if (isBindEmailButton) await page.click('#bindmail_button');
        await page.click('#top_nav > div.head_nav_item.fl_r');
        await page.waitFor(1000);
        await page.click('#top_logout_link',{button:'left'});

        await page.waitFor(2000);

        countOfAcc++;
        console.log(`account №${countOfAcc} is done`)
        continue
    }
    await browser.close();
}
  // запускаем сервер на порту 3000
app.listen(3000);
// отправляем сообщение
console.log('Сервер стартовал!');