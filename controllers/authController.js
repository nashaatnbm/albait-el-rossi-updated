const User = require(’../models/User’);
const { validationResult } = require(‘express-validator’);
const nodemailer = require(‘nodemailer’);
const crypto = require(‘crypto’);

// Email transporter
const transporter = nodemailer.createTransport({
service: ‘gmail’,
auth: {
user: process.env.EMAIL_USER || ‘nashatmohamed990@gmail.com’,
pass: process.env.EMAIL_PASS || ‘uvgd ynhp wfeg hyib’
}
});

// GET /auth/login
exports.getLogin = (req, res) => {
if (req.session.userId) return res.redirect(’/’);
res.render(‘auth/login’, {
title: ‘تسجيل الدخول’,
error: req.session.error || null,
success: req.session.success || null
});
delete req.session.error;
delete req.session.success;
};

// POST /auth/signup
exports.postSignup = async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.render(‘auth/login’, {
title: ‘تسجيل الدخول’,
error: errors.array()[0].msg,
success: null,
activeTab: ‘signup’
});
}

const { name, email, password, phone } = req.body;

try {
const existing = await User.findOne({ email });
if (existing) {
return res.render(‘auth/login’, {
title: ‘تسجيل الدخول’,
error: ‘البريد الإلكتروني مسجل بالفعل’,
success: null,
activeTab: ‘signup’
});
}

```
const count = await User.countDocuments();
const role = (count === 0 || email === process.env.ADMIN_EMAIL) ? 'admin' : 'customer';

const user = await User.create({ name, email, password, phone, role });

req.session.userId = user._id;
req.session.userName = user.name;
req.session.userEmail = user.email;
req.session.userRole = user.role;

res.redirect('/');
```

} catch (err) {
console.error(err);
res.render(‘auth/login’, {
title: ‘تسجيل الدخول’,
error: ‘حدث خطأ، حاول مرة أخرى’,
success: null,
activeTab: ‘signup’
});
}
};

// POST /auth/signin
exports.postSignin = async (req, res) => {
const { email, password } = req.body;

try {
const user = await User.findOne({ email });
if (!user || !(await user.comparePassword(password))) {
return res.render(‘auth/login’, {
title: ‘تسجيل الدخول’,
error: ‘البريد الإلكتروني أو كلمة المرور غير صحيحة’,
success: null,
activeTab: ‘signin’
});
}

```
req.session.userId = user._id;
req.session.userName = user.name;
req.session.userEmail = user.email;
req.session.userRole = user.role;

const returnTo = req.session.returnTo || '/';
delete req.session.returnTo;
res.redirect(returnTo);
```

} catch (err) {
console.error(err);
res.render(‘auth/login’, {
title: ‘تسجيل الدخول’,
error: ‘حدث خطأ، حاول مرة أخرى’,
success: null,
activeTab: ‘signin’
});
}
};

// GET /auth/logout
exports.logout = (req, res) => {
req.session.destroy(() => {
res.redirect(’/’);
});
};

// GET /auth/forgot-password
exports.getForgotPassword = (req, res) => {
res.render(‘auth/forgot-password’, {
title: ‘نسيت كلمة المرور’,
error: null,
success: null
});
};

// POST /auth/forgot-password
exports.postForgotPassword = async (req, res) => {
const { email } = req.body;
try {
const user = await User.findOne({ email });

```
if (!user) {
  return res.render('auth/forgot-password', {
    title: 'نسيت كلمة المرور',
    error: null,
    success: 'إذا كان البريد مسجلاً لدينا، ستصلك رسالة خلال دقائق.'
  });
}

// Generate token
const token = crypto.randomBytes(32).toString('hex');
user.resetToken = token;
user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
await user.save();

const resetUrl = `${process.env.BASE_URL || 'https://albait-el-rossi-updated-production.up.railway.app'}/auth/reset-password/${token}`;

await transporter.sendMail({
  from: '"البيت الروسي 🐻" <nashatmohamed990@gmail.com>',
  to: email,
  subject: 'إعادة تعيين كلمة المرور - البيت الروسي',
  html: `
    <div style="font-family:Arial,sans-serif;direction:rtl;max-width:500px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px;">
      <h2 style="color:#1a1a2e;">🐻 البيت الروسي</h2>
      <p>مرحباً ${user.name}،</p>
      <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#f0c040;color:#1a1a2e;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">إعادة تعيين كلمة المرور</a>
      <p style="color:#666;font-size:13px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
      <p style="color:#666;font-size:13px;">إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
    </div>
  `
});

res.render('auth/forgot-password', {
  title: 'نسيت كلمة المرور',
  error: null,
  success: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني ✅'
});
```

} catch (err) {
console.error(err);
res.render(‘auth/forgot-password’, {
title: ‘نسيت كلمة المرور’,
error: ‘حدث خطأ، حاول مرة أخرى’,
success: null
});
}
};

// GET /auth/reset-password/:token
exports.getResetPassword = async (req, res) => {
const { token } = req.params;
try {
const user = await User.findOne({
resetToken: token,
resetTokenExpiry: { $gt: Date.now() }
});

```
if (!user) {
  return res.render('auth/forgot-password', {
    title: 'نسيت كلمة المرور',
    error: 'الرابط غير صالح أو منتهي الصلاحية',
    success: null
  });
}

res.render('auth/reset-password', {
  title: 'إعادة تعيين كلمة المرور',
  token,
  error: null
});
```

} catch (err) {
console.error(err);
res.redirect(’/auth/forgot-password’);
}
};

// POST /auth/reset-password/:token
exports.postResetPassword = async (req, res) => {
const { token } = req.params;
const { password } = req.body;

try {
const user = await User.findOne({
resetToken: token,
resetTokenExpiry: { $gt: Date.now() }
});

```
if (!user) {
  return res.render('auth/reset-password', {
    title: 'إعادة تعيين كلمة المرور',
    token,
    error: 'الرابط غير صالح أو منتهي الصلاحية'
  });
}

user.password = password;
user.resetToken = undefined;
user.resetTokenExpiry = undefined;
await user.save();

res.render('auth/login', {
  title: 'تسجيل الدخول',
  error: null,
  success: 'تم تغيير كلمة المرور بنجاح! سجّل دخولك الآن ✅'
});
```

} catch (err) {
console.error(err);
res.render(‘auth/reset-password’, {
title: ‘إعادة تعيين كلمة المرور’,
token,
error: ‘حدث خطأ، حاول مرة أخرى’
});
}
};