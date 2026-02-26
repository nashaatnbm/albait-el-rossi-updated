const User = require('../models/User');
const { validationResult } = require('express-validator');

// GET /auth/login
exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/login', {
    title: 'تسجيل الدخول',
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
    return res.render('auth/login', {
      title: 'تسجيل الدخول',
      error: errors.array()[0].msg,
      success: null,
      activeTab: 'signup'
    });
  }

  const { name, email, password, phone } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('auth/login', {
        title: 'تسجيل الدخول',
        error: 'البريد الإلكتروني مسجل بالفعل',
        success: null,
        activeTab: 'signup'
      });
    }

    // First user becomes admin
    const count = await User.countDocuments();
    const role = (count === 0 || email === process.env.ADMIN_EMAIL) ? 'admin' : 'customer';

    const user = await User.create({ name, email, password, phone, role });

    // Auto login after signup
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      title: 'تسجيل الدخول',
      error: 'حدث خطأ، حاول مرة أخرى',
      success: null,
      activeTab: 'signup'
    });
  }
};

// POST /auth/signin
exports.postSignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', {
        title: 'تسجيل الدخول',
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        success: null,
        activeTab: 'signin'
      });
    }

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      title: 'تسجيل الدخول',
      error: 'حدث خطأ، حاول مرة أخرى',
      success: null,
      activeTab: 'signin'
    });
  }
};

// GET /auth/logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// GET /auth/forgot-password
exports.getForgotPassword = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'نسيت كلمة المرور',
    error: req.session.error || null,
    success: req.session.success || null
  });
  delete req.session.error;
  delete req.session.success;
};

// POST /auth/forgot-password
exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    // Always show success to prevent email enumeration
    if (!user) {
      return res.render('auth/forgot-password', {
        title: 'نسيت كلمة المرور',
        error: null,
        success: 'إذا كان البريد مسجلاً لدينا، سيتم التواصل معك عبر واتساب لإعادة تعيين كلمة المرور.'
      });
    }

    // Since no email service, direct to WhatsApp
    const waNumber = process.env.WHATSAPP_NUMBER || '966500000000';
    const msg = encodeURIComponent(`مرحباً، أريد إعادة تعيين كلمة المرور للحساب المرتبط بـ: ${email}`);
    return res.render('auth/forgot-password', {
      title: 'نسيت كلمة المرور',
      error: null,
      success: `يُرجى التواصل معنا عبر واتساب لإعادة تعيين كلمة المرور. <a href="https://wa.me/${waNumber}?text=${msg}" target="_blank" style="color:#25d366;font-weight:bold;">اضغط هنا للتواصل عبر واتساب 💬</a>`
    });
  } catch (err) {
    console.error(err);
    res.render('auth/forgot-password', {
      title: 'نسيت كلمة المرور',
      error: 'حدث خطأ، حاول مرة أخرى',
      success: null
    });
  }
};
