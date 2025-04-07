# The Lectures Fetcher

The Lectures sitesindeki sunumları otomatik olarak indiren bir araç.

## Gereksinimler

- Node.js (v12 veya daha yeni sürüm)

## Kurulum

1. Repo'yu clonelayın, dosyaya cli üzerinden girin.
2. Aşağıdaki komutu çalıştırarak gerekli paketleri yükleyin:

```bash
npm install
```

## Kullanım

### 1. Seçenek: URL'leri bir dosyada belirtme

1. Proje klasöründe `urls.txt` adında bir dosya oluşturun
2. Her satıra bir URL olacak şekilde taramak istediğiniz sayfaları ekleyin
3. Kodu çalıştırın:

```bash
node index.js
```

### 2. Seçenek: URL'leri komut satırı argümanları olarak belirtme

```bash
node index.js https://yglect.com/2023/07/20/isletmeye-giris/ https://baska-bir-url.com
```

## Nasıl Çalışır?

Kod şu adımları takip etmekte:

1. `urls.txt` dosyasından veya komut satırı argümanlarından URL listesini yükler
2. Her URL için:
   - HTML içeriğini indirir
   - Sayfa başlığını çıkarır
   - PPTX dosyalarına olan tüm bağlantıları bulur
   - Her bir PPTX dosyasını indirir
   - Dosyaları `downloads` klasörüne sayfa başlığı ve bağlantı metnine göre isimlendirerek kaydeder

## Neyi Arar?

Kod özellikle şunları arar:
- İndirme düğmeleri içeren WordPress dosya bloklarını (örn. "Sunumu indirmek için tıklayınız" düğmesi)
- `.pptx` uzantılı dosyalara doğrudan bağlantıları

## Çıktı

İndirilen dosyalar, kod ile aynı dizindeki `downloads` klasörüne kaydedilir. Dosya adları, sayfa başlığı ve bağlantı metnine dayanarak oluşturulur.

## Hata Giderme

- Script çalışmazsa `node -v` komutunu çalıştırarak Node.js'in yüklü olduğundan emin olun
- "Module not found" hatası alırsanız `npm install` komutunu tekrar çalıştırın
- URL'ler hatalıysa veya ulaşılamazsa, script bu durumu belirtecek ve diğer URL'lerle devam edecektir
- Türkçe karakterler içeren dosya adları için özel düzenleme yapılmıştır

## Çalışma Örneği

```
PPTX indirme işlemi başlatılıyor...
İşlenecek 1 URL bulundu
URL işleniyor: https://yglect.com/2023/07/20/isletmeye-giris/
https://yglect.com/2023/07/20/isletmeye-giris/ adresinde 1 PPTX bağlantısı bulundu
İndiriliyor: https://yglect.com/wp-content/uploads/2023/07/2025-isletme-giris.pptx
downloads/isletmeye_giris_the_lectures_sunumu_indirmek_icin_tiklayiniz1.pptx olarak indirildi
Tüm indirmeler tamamlandı!
```