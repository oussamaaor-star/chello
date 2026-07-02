# 📧 Emails Chello — templates brandés + mise en route

3 emails d'authentification aux couleurs Chello (crème/ink, bilingue AR/EN, responsive).
**Variable Supabase `{{ .ConfirmationURL }}` à NE JAMAIS supprimer** (c'est le lien d'action).

| Fichier | Template Supabase | Sujet à coller |
|---|---|---|
| `01-confirm-signup.html` | **Confirm signup** | `تأكيدي بريدكِ لإتمام التسجيل · Confirm your email — Chello` |
| `02-reset-password.html` | **Reset Password** | `إعادة تعيين كلمة المرور · Reset your password — Chello` |
| `03-magic-link.html` | **Magic Link** | `رابط الدخول إلى حسابكِ · Your login link — Chello` |

---

## ⚙️ Mise en route (1 seule fois) — ordre à respecter

> ⚠️ Supabase **verrouille l'édition des templates** tant que le SMTP n'est pas configuré
> (« Set up custom SMTP to edit templates »). Il faut donc faire les étapes 1→3 d'abord.

### 1. Un domaine
Acheter `chello.om` (ou `.com`) — règle aussi l'URL finale du site.

### 2. Vérifier le domaine dans Resend
- resend.com → **Domains** → *Add Domain* → saisir le domaine.
- Ajouter les **DNS** (SPF + DKIM) fournis chez le registrar → attendre « Verified ».

### 3. SMTP Resend dans Supabase
**Dashboard Supabase → Authentication → Emails → onglet SMTP Settings** → *Enable custom SMTP* :
| Champ | Valeur |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | **la clé `RESEND_API_KEY`** |
| Sender email | `noreply@<ton-domaine>` |
| Sender name | `Chello` |

→ Sauvegarder. **Ça déverrouille l'édition des templates** + rend tous les emails d'auth fiables et brandés.

### 4. Coller les 3 templates
**Authentication → Emails → onglet Templates** → pour chaque template (Confirm signup, Reset Password, Magic Link) :
- coller le **Sujet** (tableau ci-dessus),
- ouvrir le fichier `.html` correspondant, **tout copier**, coller dans le **corps (Message body)**,
- **Save**.

### 5. Emails côté boutique (welcome + confirmation COD)
Ces emails partent via l'**API Resend** (pas Supabase). Pour qu'ils atteignent les clientes :
**Vercel → projet `chello` → Settings → Environment Variables** → `EMAIL_FROM = Chello <noreply@<ton-domaine>>` → **Redeploy**.

> Tant que le domaine n'est pas vérifié, Resend est en **mode test** : il n'envoie qu'à l'adresse du compte (oussamaaor@gmail.com). C'est pour ça que l'email de bienvenue ne partait pas vers les clientes.

---

## ✅ Pour tester après config
1. Crée un compte test avec une **autre** adresse → l'email de confirmation doit arriver, brandé Chello.
2. Passe une commande COD → l'email de confirmation client doit arriver.
3. « Mot de passe oublié » → l'email de reset brandé doit arriver.
