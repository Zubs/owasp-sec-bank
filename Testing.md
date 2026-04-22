# 🧪 Sec-Bank: Manual Testing Guidelines

Welcome to the Sec-Bank testing phase. Please read this entire document carefully before you begin testing.

## 📖 1. Project Overview

This project demonstrates, detects, and mitigates the **OWASP Top 10 Web Application Vulnerabilities** in a realistic banking environment.

We have deployed **two distinct versions** of the Sec-Bank application for A/B testing:
* **Version A (The Insecure Version):** This version has been deliberately engineered to contain critical security flaws (such as SQL Injection, Broken Access Control, Cross-Site Scripting, etc.). It serves as a baseline to understand how these vulnerabilities are exploited.
* **Version B (The Secure Version):** This is the hardened version. It shares the exact same user interface and functionality as Version A, but the underlying code has been secured using industry best practices to mitigate the OWASP Top 10.

## 🔗 2. Testing Environments

You will need to interact with both environments during your testing.

**Version A (Insecure) Links:**
* **Frontend UI:** [https://owasp-insecure.netlify.app](https://owasp-insecure.netlify.app)
* **Backend API:** [https://owasp-sec-bank-insecure.onrender.com](https://owasp-sec-bank-insecure.onrender.com)

**Version B (Secure) Links:**
* **Frontend UI:** [https://owasp-secure.netlify.app](https://owasp-secure.netlify.app)
* **Backend API:** [https://owasp-sec-bank-secure.onrender.com](https://owasp-sec-bank-secure.onrender.com)

## ⚠️ 3. Rules of Engagement

To ensure a safe and productive testing phase, you **must** adhere strictly to the following rules:

1. **Do not attempt to DDoS the server.** Denial of Service testing is out of scope and will disrupt the environments for other testers.
2. **Do not run automated vulnerability scanners (like Nessus) against the production database; manual testing only.**
3. **Application is created for educational purposes, and deliberately insecure, as such do NOT use real personal data, real passwords you use elsewhere, or real financial information when creating test accounts.**

## ⚖️ 4. A/B Testing Methodology (Identical Execution)

We are evaluating both the security efficacy of Version B and its impact on user experience. For our data to be valid, both versions must be tested in the **exact same way**.

* **Mirror Your Actions:** If you attempt a specific SQL injection payload on the login screen of Version A, you must attempt the exact same payload on the login screen of Version B.
* **Standard User Flows:** If you test normal functionality (e.g., transferring funds), execute the exact same steps in both versions.
* **Environment Consistency:** Use the same browser, the same testing tools (e.g., Burp Suite, OWASP ZAP manual proxy, browser DevTools), and the same network environment for both versions.

## 📝 5. Record Keeping & Metrics

Please log every test case you execute using any reporting tool/spreadsheet of your choice (A JSON file is preferred). For every test, record the following metrics:

* **Date & Name**
* **Target Feature:** (e.g., Login, Transfer Funds, Update Profile)
* **Target Vulnerability:** (e.g., A01: Broken Access Control, A03: Injection)
* **Payload / Action Taken:** (e.g., `' OR 1=1--` or attempting IDOR via URL manipulation)
* **Time Taken to Test:** (Minutes spent formulating and executing the test)
* **Ease of Discovery / Exploitation (Scale 1-5):**
    * 1 = Very Difficult / Impossible (Fully secure)
    * 2 = Difficult (Requires advanced knowledge/tools)
    * 3 = Moderate (Requires some effort/guessing)
    * 4 = Easy (Found with basic testing)
    * 5 = Very Easy / Trivial (Found immediately without trying)
* **Outcome Version A:** (e.g., "Bypassed login successfully")
* **Outcome Version B:** (e.g., "Received generic 'Invalid credentials' error")
* **General Notes/Observations:** Did the secure version feel slower? Was the error message helpful? Did security mechanisms negatively impact usability?
