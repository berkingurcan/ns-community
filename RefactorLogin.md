# Refactor: Discord Login ve Proje Statüleri

Bu doküman, mevcut Solana Wallet altyapısının Discord login ile değiştirilmesi ve projelere yeni statülerin eklenmesi için yapılacak refactor sürecini planlamaktadır.

## Adım 1: Proje Statülerinin Güncellenmesi

1.  **Veritabanı Şeması Güncellemesi:**
    *   `projects` tablosundaki `status` alanı (veya benzeri bir alan) güncellenerek yeni değerleri kabul etmesi sağlanacak.
    *   Yeni statüler: `showcase`, `NS-Only`, `Archive`, `Draft`.
    *   Bu değişiklik için bir Supabase migration dosyası oluşturulacak.

2.  **Backend ve Tip Güncellemeleri:**
    *   `src/types/project.ts` dosyasındaki `Project` tipi güncellenerek yeni statüleri içerecek şekilde düzenlenecek.
    *   Proje oluşturma ve güncelleme ile ilgili backend fonksiyonları (`src/lib/projects.ts`) yeni statüleri destekleyecek şekilde güncellenecek.

3.  **Frontend Güncellemeleri:**
    *   `src/components/ui/ProjectForm.tsx` içerisindeki formda, proje statüsü seçimi için yeni seçenekler eklenecek.
    *   `src/components/ui/ProjectCard.tsx` ve proje detay sayfaları (`src/app/projects/page.tsx`), yeni statüleri doğru şekilde gösterecek ve filtreleyecek şekilde güncellenecek.

## Adım 2: Kimlik Doğrulama (Authentication) Sisteminin Değiştirilmesi

Mevcut `Solana Wallet` tabanlı kimlik doğrulama sistemi tamamen kaldırılarak yerine `Discord OAuth` tabanlı bir sistem entegre edilecektir.

1.  **Mevcut Auth Altyapısının Kaldırılması:**
    *   `src/app/providers/wallet-provider.tsx` kaldırılacak veya içeriği temizlenecek.
    *   `src/lib/nftVerification.ts` gibi Solana'ya özel dosyalar kaldırılacak.
    *   Giriş butonları ve cüzdan bağlantı mantığı UI'dan temizlenecek.

2.  **Discord OAuth Entegrasyonu (NextAuth.js ile):**
    *   Gerekli paketler yüklenecek (`next-auth`, `@auth/core`, `@auth/drizzle-adapter` veya benzeri).
    *   Discord Developer Portal'dan yeni bir OAuth aplikasyonu oluşturulup `Client ID` ve `Client Secret` alınacak. Bu bilgiler `.env.local` dosyasına eklenecek.
    *   `NextAuth.js` konfigürasyonu yapılacak. Discord Provider eklenecek.
    *   Kullanıcı şeması (`users` tablosu) Discord'dan gelen `id`, `username`, `avatar` gibi bilgileri saklayacak şekilde güncellenecek.

3.  **Auth Context ve Session Yönetimi:**
    *   `src/context/AuthContext.tsx` Discord session bilgilerini (`user`, `accessToken` vb.) tutacak şekilde güncellenecek.
    *   `SessionProvider` (`NextAuth.js`'in sağladığı) `src/app/layout.tsx` dosyasına eklenerek tüm uygulamayı sarmalayacak.

4.  **UI Değişiklikleri:**
    *   "Connect Wallet" butonu yerine "Login with Discord" butonu eklenecek.
    *   `signIn('discord')` ve `signOut()` fonksiyonları kullanılarak login/logout işlemleri gerçekleştirilecek.
    *   Kullanıcı profil bilgileri (avatar, kullanıcı adı) navigasyon barı gibi yerlerde gösterilecek.

## Adım 3: Yetkilendirme (Authorization) Mantığının Eklenmesi

Kullanıcıların Discord ile giriş yaptıktan sonra yetkileri, belirli bir listede (burada "X Listesi" olarak adlandırılmıştır) olup olmamalarına göre belirlenecektir.

1.  **"X Listesi"nin Tanımlanması ve Kontrolü:**
    *   **Tanım:** Bu listenin ne olduğu netleştirilmelidir. Bir Discord sunucusundaki rol mü, yoksa veritabanında tutulan bir Discord kullanıcı ID listesi mi? Şimdilik veritabanında `allowed_users` gibi bir tabloda tutulan bir liste olduğu varsayılacaktır.
    *   **Kontrol Mekanizması:** Kullanıcı Discord ile giriş yaptığında, `NextAuth.js`'in `callbacks` objesi içindeki `signIn` veya `jwt`/`session` callback'leri kullanılarak kullanıcının Discord ID'sinin bu listede olup olmadığı kontrol edilecek.

2.  **Yetkiye Göre Yönlendirme ve İçerik Gösterimi:**
    *   **Yetkili Kullanıcı (Listede Olan):**
        *   Uygulamanın tamamına erişebilir.
        *   Profil oluşturabilir (`/profile`).
        *   Projelerin detaylarını ve ihtiyaçlarını görebilir (`/projects`).
    *   **Yetkisiz Kullanıcı (Listede Olmayan):**
        *   Uygulamanın sınırlı bir versiyonunu görür.
        *   Ana sayfada veya belirli sayfalarda projeleri göremez.
        *   Profil oluşturma ve proje detaylarına erişim engellenir.
        *   UI'da belirgin bir "Contact Us" butonu gösterilir. Bu buton bir `mailto:` linki veya bir iletişim formuna yönlendirebilir.
    *   **Teknik Uygulama:**
        *   `src/hoc/withAuth.tsx` HOC (Higher-Order Component) veya benzer bir middleware yapısı, sayfa bazında yetki kontrolü yapmak için güncellenecek.
        *   Kullanıcının yetki durumu (örneğin `session.user.isAllowed`) session objesine eklenecek ve bu bilgiye göre UI'da koşullu render'lama yapılacak.

## Adım 4: Veritabanı Değişiklikleri

1.  **`users` Tablosu:**
    *   Mevcut `users` tablosu, Discord ile ilgili alanları içerecek şekilde güncellenmeli veya yeniden oluşturulmalıdır. (`discord_id`, `username`, `avatar_url`, `email` vb.). Solana ile ilgili `wallet_address` gibi alanlar kaldırılacak.
2.  **`projects` Tablosu:**
    *   `status` alanı `ENUM('showcase', 'NS-Only', 'Archive', 'Draft')` olarak güncellenecek.
3.  **`allowed_users` Tablosu (Opsiyonel):**
    *   Yetkilendirme için kullanılacaksa, `discord_id` (PRIMARY KEY, TEXT) sütununu içeren basit bir tablo oluşturulacak.
