# تطبيق قائمة المهام (To-Do List)

هذا تطبيق قائمة مهام كامل المكدس (Full-Stack) يتكون من واجهة خلفية مبنية باستخدام Node.js و Express.js وواجهة أمامية بسيطة مبنية باستخدام HTML/CSS/JavaScript.

## الميزات

*   مصادقة المستخدم (التسجيل، تسجيل الدخول)
*   إنشاء، قراءة، تحديث، حذف (CRUD) لمهام قائمة المهام
*   إدارة ملف تعريف المستخدم
*   توثيق واجهة برمجة التطبيقات (API) باستخدام Swagger

## التقنيات المستخدمة

### الواجهة الخلفية (Backend)

*   Node.js
*   Express.js
*   SQLite (عبر `sqlite3`)
*   JWT للمصادقة
*   Bcrypt لتشفير كلمات المرور
*   `dotenv` لمتغيرات البيئة
*   `morgan` لتسجيل الطلبات
*   `cors` لمشاركة الموارد عبر النطاقات
*   `swagger-ui-express` و `yamljs` لتوثيق واجهة برمجة التطبيقات

### الواجهة الأمامية (Frontend)

*   HTML5
*   CSS3
*   JavaScript (ES6+)

## تعليمات الإعداد

### المتطلبات الأساسية

*   Node.js (يوصى بإصدار LTS)
*   npm (يأتي مع Node.js)

### 1. استنساخ المستودع (Clone the repository)

```bash
git clone <repository_url>
cd "To-Do-List Backend"
```

### 2. إعداد الواجهة الخلفية (Backend Setup)

انتقل إلى دليل `backend` وقم بتثبيت التبعيات:

```bash
cd backend
npm install
```

أنشئ ملف `.env` في دليل `backend` بالمحتوى التالي:

```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL=./database.sqlite
```

استبدل `your_jwt_secret_key_here` بسلسلة قوية وعشوائية.

### 3. إعداد الواجهة الأمامية (Frontend Setup)

توجد الواجهة الأمامية في دليل `frontend` ولا تتطلب أي خطوات تثبيت محددة. إنها مجموعة من ملفات HTML و CSS و JavaScript الثابتة.

## تشغيل التطبيق

### 1. بدء تشغيل خادم الواجهة الخلفية (Start the Backend Server)

من دليل `backend`، قم بتشغيل:

```bash
npm start
```

سيبدأ خادم الواجهة الخلفية على `http://localhost:5000` (أو المنفذ الذي حددته في `.env`).

### 2. الوصول إلى الواجهة الأمامية (Access the Frontend)

افتح ملف `frontend/index.html` في متصفح الويب الخاص بك. يمكنك أيضًا استخدام إضافة خادم مباشر في بيئة التطوير المتكاملة الخاصة بك (مثل Live Server لـ VS Code) لخدمة ملفات الواجهة الأمامية.

## نقاط نهاية واجهة برمجة التطبيقات (API Endpoints) (الواجهة الخلفية)

توثيق واجهة برمجة التطبيقات متاح عبر Swagger UI بمجرد تشغيل خادم الواجهة الخلفية:

`http://localhost:5000/api-docs`

فيما يلي نظرة عامة موجزة على مسارات API الرئيسية:

*   **المصادقة (`/api/auth`)**
    *   `POST /api/auth/register`: تسجيل مستخدم جديد.
    *   `POST /api/auth/login`: تسجيل دخول مستخدم والحصول على رمز JWT.

*   **المستخدمون (`/api/users`)**
    *   `GET /api/users/profile`: الحصول على ملف تعريف المستخدم المصادق عليه.
    *   `PUT /api/users/profile`: تحديث ملف تعريف المستخدم المصادق عليه.

*   **المهام (`/api/tasks`)**
    *   `GET /api/tasks`: الحصول على جميع المهام للمستخدم المصادق عليه.
    *   `POST /api/tasks`: إنشاء مهمة جديدة.
    *   `GET /api/tasks/:id`: الحصول على مهمة محددة بواسطة المعرف.
    *   `PUT /api/tasks/:id`: تحديث مهمة محددة بواسطة المعرف.
    *   `DELETE /api/tasks/:id`: حذف مهمة محددة بواسطة المعرف.

## هيكل المشروع

```
To-Do-List Backend/
├── backend/                  # الواجهة الخلفية Node.js Express
│   ├── src/                  # الكود المصدري
│   │   ├── app.js            # تهيئة تطبيق Express
│   │   ├── server.js         # نقطة دخول الخادم
│   │   ├── config/           # ملفات التهيئة
│   │   ├── controllers/      # معالجات المسارات
│   │   ├── middleware/       # برمجيات Express الوسيطة
│   │   ├── models/           # نماذج قاعدة البيانات
│   │   └── routes/           # مسارات API
│   ├── .env                  # متغيرات البيئة (مثال)
│   ├── package.json          # تبعيات الواجهة الخلفية
│   └── docs/                 # توثيق API (Swagger)
├── frontend/                 # واجهة أمامية ثابتة HTML/CSS/JS
│   ├── index.html            # الصفحة الرئيسية
│   ├── login.html            # صفحة تسجيل الدخول
│   ├── register.html         # صفحة التسجيل
│   ├── dashboard.html        # لوحة تحكم المستخدم
│   ├── profile.html          # صفحة ملف تعريف المستخدم
│   ├── css/                  # أوراق أنماط CSS
│   ├── js/                   # ملفات JavaScript
│   └── assets/               # الأصول الثابتة (الصور، إلخ.)
├── package.json              # تبعيات على مستوى المشروع (إن وجدت)
└── README.md                 # ملف README للمشروع
```