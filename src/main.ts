import qrcode from 'qrcode-generator';
import '@knadh/oat/oat.min.css';
import wechatSansStdMediumUrl from './assets/WeChatSansStd-Medium.woff2?url';
import wechatTemplateUrl from './assets/wechat.webp?url';
import alipayTemplateUrl from './assets/alipay.webp?url';
import evalExpression from './eval-expression';

const $wechat = document.getElementById('wechat') as HTMLInputElement;
const $alipay = document.getElementById('alipay') as HTMLInputElement;
const $scanwechat = document.getElementById('scan-wechat') as HTMLButtonElement;
const $scanalipay = document.getElementById('scan-alipay') as HTMLButtonElement;
const $amount = document.getElementById('amount') as HTMLInputElement;
const $note = document.getElementById('note') as HTMLInputElement;
const $name = document.getElementById('name') as HTMLInputElement;
const $divide = document.getElementById('divide') as HTMLInputElement;
const $submit = document.getElementById('submit') as HTMLButtonElement;
const $dialog = document.getElementById('dialog') as HTMLDivElement;
const $result = document.getElementById('result') as HTMLImageElement;

const loadImage = (src: string | Blob) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image;
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = (src instanceof Blob) ? URL.createObjectURL(src) : src;
});

const fillTextCenter = (ctx: OffscreenCanvasRenderingContext2D, text: string, x: number, y: number) => {
    const tm = ctx.measureText(text);
    ctx.fillText(text, x - tm.width / 2, y + (tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent) / 2);
};

const pickFile = (accept: string = '', multiple: boolean = false) => new Promise<FileList>((resolve, reject) => {
    const el = document.createElement('input');
    el.type = 'file';
    el.accept = accept;
    el.multiple = multiple;
    el.addEventListener('change', () => resolve(el.files!));
    el.addEventListener('cancel', reject);
    el.click();
});

const wechatSansFont = (async () => {
    const fontface = new FontFace('WeChat Sans Std', `url(${wechatSansStdMediumUrl})`);
    document.fonts.add(fontface);
    return fontface.load();
})();

[wechatTemplateUrl, alipayTemplateUrl].forEach(e => {
    const el = document.createElement('link');
    el.rel = 'preload';
    el.as = 'image';
    el.href = e;
    document.head.appendChild(el);
});

const wechatPaycode = async (url: string, name: string, amount: string, note: string) => {
    await wechatSansFont;
    const template = await loadImage(wechatTemplateUrl);
    const qr = qrcode(0, 'Q');
    qr.addData(url);
    qr.make();
    const qrcodeImage = await loadImage(`data:image/svg+xml,${encodeURIComponent(qr.createSvgTag(1, 0))}`);
    const canvas = new OffscreenCanvas(1080, 1680);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(template, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(195, 364, 689, amount ? (note ? 873 : 825) : 753, 25);
    ctx.fill();
    if (!url) {
        ctx.filter = 'blur(20px) opacity(.4)';
    }
    ctx.drawImage(qrcodeImage, 302, amount ? (note ? 592 : 544) : 472, 475, 475);
    if (!url) {
        ctx.filter = 'none';
        ctx.font = '400 64px system-ui, sans-serif';
        ctx.fillStyle = '#000';
        fillTextCenter(ctx, '未启用', 540, amount ? (note ? 830 : 782) : 710);
    }
    ctx.font = '500 48px system-ui, sans-serif';
    ctx.fillStyle = '#000';
    fillTextCenter(ctx, name, 540, amount ? (note ? 1141 : 1093) : 1021);
    if (amount) {
        ctx.font = '500 64px "WeChat Sans Std"';
        fillTextCenter(ctx, '￥' + amount, 540, 458);
        if (note) {
            ctx.font = '400 32px system-ui, sans-serif';
            ctx.fillStyle = '#737373';
            fillTextCenter(ctx, note, 540, 534);
        }
    }
    return canvas.convertToBlob();
};

const alipayPaycode = async (url: string, name: string, amount: string, note: string) => {
    const template = await loadImage(alipayTemplateUrl);
    const qr = qrcode(0, 'H');
    qr.addData(url);
    qr.make();
    const qrcodeImage = await loadImage(`data:image/svg+xml,${encodeURIComponent(qr.createSvgTag(1, 0))}`);
    const canvas = new OffscreenCanvas(1080, 1680);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(template, 0, 0);
    if (amount) {
        ctx.fillStyle = '#1678ff';
        ctx.beginPath();
        ctx.rect(0, 1390, 1080, 290);
        ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.rect(161, 522, 757, amount ? (note ? 1018 : 959) : 866);
    ctx.fill();
    if (!url) {
        ctx.filter = 'blur(20px) opacity(.4)';
    }
    ctx.drawImage(qrcodeImage, 216, 577, 647, 647);
    if (!url) {
        ctx.filter = 'none';
        ctx.font = '400 64px system-ui, sans-serif';
        ctx.fillStyle = '#3e3a39';
        fillTextCenter(ctx, '未启用', 540, 900);
    }
    ctx.font = '400 64px system-ui, sans-serif';
    ctx.fillStyle = '#3e3a39';
    fillTextCenter(ctx, name, 540, 1292);
    if (amount) {
        ctx.font = '500 80px system-ui, sans-serif';
        fillTextCenter(ctx, '￥' + amount, 540, 1396);
        if (note) {
            ctx.font = '400 40px system-ui, sans-serif';
            ctx.fillStyle = '#9a9a9a';
            fillTextCenter(ctx, note, 540, 1482);
        }
    }
    return canvas.convertToBlob();
};

$dialog.onclick = () => {
    $dialog.style.display = 'none';
    URL.revokeObjectURL($result.src);
};

let resultRotate = false;
const setResultSize = () => {
    if (resultRotate) {
        if (screen.width > screen.height) {
            $result.style.width = '100vh';
            $result.style.height = 'auto';
        } else {
            $result.style.width = 'auto';
            $result.style.height = '100vw';
        }
        $result.style.transform = 'rotate(90deg)';
    } else {
        if (screen.width > screen.height) {
            $result.style.width = 'auto';
            $result.style.height = '100vh';
        } else {
            $result.style.width = '100vw';
            $result.style.height = 'auto';
        }
        $result.style.transform = '';
    }
};
setResultSize();
addEventListener('resize', setResultSize);
$result.onclick = e => {
    e.stopPropagation();
    resultRotate = !resultRotate;
    setResultSize();
};

const setConfigHash = () => {
    const sp = new URLSearchParams;
    if ($wechat.value) sp.set('wechat', $wechat.value);
    if ($alipay.value) sp.set('alipay', $alipay.value);
    if ($name.value) sp.set('name', $name.value);
    if ($amount.value) sp.set('amount', $amount.value);
    if ($note.value) sp.set('note', $note.value);
    if ($divide.checked) sp.set('divide', true.toString());
    location.hash = `#${sp}`;
};

$wechat.onchange = $alipay.onchange = $name.onchange = $amount.onchange = $note.onchange = $divide.onchange = setConfigHash;

try {
    const sp = new URLSearchParams(location.hash.replace(/^#/, ''));
    if (sp.has('wechat')) $wechat.value = sp.get('wechat')!;
    if (sp.has('alipay')) $alipay.value = sp.get('alipay')!;
    if (sp.has('name')) $name.value = sp.get('name')!;
    if (sp.has('amount')) $amount.value = sp.get('amount')!;
    if (sp.has('note')) $note.value = sp.get('note')!;
    if (sp.has('divide')) $divide.checked = true;
} catch {}

$submit.onclick = async () => {
    const wechat = $wechat.value;
    const alipay = $alipay.value;
    const amountParsed = (() => {
        try {
            return evalExpression($amount.value);
        } catch {
            return null;
        }
    })();
    const amount = $amount.value
        ? (amountParsed ? amountParsed[1] : parseFloat($amount.value)).toFixed(2)
        : '';
    const note = ($divide.checked
        ? $note.value.replace(
            /[\d\.+\-*/()\s]+/g,
            (...m) => {
                if (m[0].match(/\s+/)) return m[0];
                try {
                    const [formatted, result] = evalExpression(m[0]);
                    return formatted === m[0] ? m[0] : `${formatted} = ${result.toFixed(2)}`;
                } catch {
                    return m[0];
                }
            },
        )
        : $note.value) || (
            ($divide.checked && amountParsed) ? `${amountParsed[0]} = ${amountParsed[1].toFixed(2)}` : ''
        );
    const name = $name.value

    const [wechatPaycodeImage, alipayPaycodeImage] = await Promise.all([
        wechatPaycode(wechat, name, amount, note).then(loadImage),
        alipayPaycode(alipay, name, amount, note).then(loadImage),
    ])
    const canvas = new OffscreenCanvas(2160, 1680);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(wechatPaycodeImage, 0, 0);
    ctx.drawImage(alipayPaycodeImage, 1080, 0);
    $result.src = await canvas.convertToBlob().then(e => URL.createObjectURL(e));
    $dialog.style.display = 'flex';
};

$scanwechat.onclick = $scanalipay.onclick = async () => {
    const image = await pickFile('image/*');
    const QRScanner = await import('qr-scanner').then(e => e.default);
    await QRScanner.scanImage(image[0], { returnDetailedScanResult: true })
        .then(({ data }) => {
            if (data.match(/^wxp:\/\/[A-Za-z\d\-_]+$/g)) {
                $wechat.value = data;
                setConfigHash();
            } else if (data.match(/^https:\/\/qr\.alipay\.com\/[a-z\d]+$/g)) {
                $alipay.value = data;
                setConfigHash();
            } else {
                alert(`没有识别到收款码\n扫码内容：${data}`);
            }
        })
        .catch(err => alert(`无法识别二维码：${err}`));
};
