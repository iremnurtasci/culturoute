# Culturoute

Culturoute, Avrupa'nın zengin kültürel mirasını keşfetmek, kişiselleştirilmiş kültür rotaları oluşturmak ve bu rotaları paylaşmak için tasarlanmış interaktif bir web uygulamasıdır.

**Sunum Bağlantısı**: https://www.canva.com/design/DAGqDN2PpZU/6P3x7_4yQCDo3uGTIAe-3Q/edit?utm_content=DAGqDN2PpZU&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Proje Hakkında

Culturoute, Europeana API'sini kullanarak Avrupa'nın çeşitli ülkelerindeki müze, galeri ve kültürel kuruluşların koleksiyonlarına erişim sağlar. Kullanıcılar sanat eserleri, tarihi eserler ve kültürel öğeleri arayabilir, filtreleyebilir ve bu öğelerden kişiselleştirilmiş seyahat rotaları oluşturabilirler.

### Temel Özellikler

- **Kültürel Öğe Arama**: Ülke, tür ve anahtar kelime bazında kültürel öğeleri filtreleme ve arama
- **İnteraktif Harita**: Kültürel öğeleri harita üzerinde görüntüleme
- **Rota Oluşturma**: Seçilen kültürel öğelerden özel rotalar oluşturma
- **Rota Yönetimi**: Oluşturulan rotaları kaydetme, düzenleme ve silme
- **Rota Paylaşımı**: Oluşturulan rotaları sosyal medyada veya link olarak paylaşma

## Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

**Not:** Bu proje node_modules klasörünü içermez. Klasör, aşağıdaki adımlarda `npm install` komutu çalıştırıldığında otomatik olarak oluşturulacaktır.

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm (v6 veya üzeri)
- Herhangi bir kod editörü (Visual Studio Code, Sublime Text, Atom vb.)

### Adımlar

1. Projeyi GitHub'dan indirin:
   - GitHub sayfasındaki yeşil "Code" butonuna tıklayın
   - "Download ZIP" seçeneğini kullanarak projeyi ZIP olarak indirin
   - İndirilen ZIP dosyasını bilgisayarınızda bir klasöre çıkarın
   - Komut satırında (Terminal veya Command Prompt) bu klasöre gidin

2. Gerekli bağımlılıkları yükleyin:
   - Komut satırında (Terminal veya Command Prompt) aşağıdaki komutu çalıştırın:
   ```bash
   npm install
   ```
   - Bu komut, package.json dosyasında belirtilen tüm bağımlılıkları (node_modules klasörü) otomatik olarak indirecektir
   - İndirme işlemi internet bağlantınıza bağlı olarak birkaç dakika sürebilir

3. Uygulamayı başlatın:
   - Aşağıdaki komutu çalıştırın:
   ```bash
   npm start
   ```
   - Bu komut geliştirme sunucusunu başlatacak ve uygulama otomatik olarak varsayılan tarayıcınızda açılacaktır
   - Eğer tarayıcı otomatik olarak açılmazsa, tarayıcınızı açın ve şu adresi ziyaret edin:
   ```
   http://localhost:3000
   ```

### Derleme

Projeyi production ortamı için derlemek isterseniz:
```bash
npm run build
```

Derlenen dosyalar `build` klasöründe oluşturulacaktır.

## Teknolojiler

Bu proje aşağıdaki teknolojileri kullanmaktadır:

- **React**: Kullanıcı arayüzü için 
- **TypeScript**: Tip güvenliği ve kod kalitesi için
- **Leaflet & React-Leaflet**: İnteraktif haritalar için
- **Axios**: API istekleri için
- **React Router**: Sayfa yönlendirmeleri için
