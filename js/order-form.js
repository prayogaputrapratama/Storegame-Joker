// ============================================
// ORDER FORM HANDLER - Storegame Joker
// ============================================

var OrderForm = {
  _data: {},

  // Deteksi tipe produk berdasarkan nama kategori
  detectType: function(product, category) {
    var p = (product + ' ' + category).toLowerCase();
    if (p.includes('mobile legend') || p.includes('diamond') || p.includes('ml')) return 'game_ml';
    if (p.includes('free fire') || p.includes('ff')) return 'game_ff';
    if (p.includes('top up') || p.includes('game')) return 'game';
    if (p.includes('pulsa')) return 'pulsa';
    if (p.includes('paket data') || p.includes('kuota') || p.includes('data')) return 'data';
    if (p.includes('pln') || p.includes('listrik') || p.includes('token')) return 'pln';
    if (p.includes('dana') || p.includes('gopay') || p.includes('ovo') || p.includes('shopeepay') || p.includes('e-wallet')) return 'ewallet';
    if (p.includes('followers') || p.includes('likes') || p.includes('views') || p.includes('subscriber') || p.includes('sosmed') || p.includes('suntik')) return 'sosmed';
    return 'manual'; // Aplikasi premium dll → WA
  },

  // Render form sesuai tipe
  renderForm: function(type) {
    var forms = {
      game_ml: `
        <div class="order-field">
          <label>User ID Mobile Legends</label>
          <input type="text" id="of-userid" placeholder="Contoh: 12345678" inputmode="numeric"/>
        </div>
        <div class="order-field">
          <label>Zone ID</label>
          <input type="text" id="of-zoneid" placeholder="Contoh: 1234" inputmode="numeric"/>
        </div>
        <button class="of-verify-btn" onclick="OrderForm.verifyML()">🔍 Cek Nickname</button>
        <div id="of-verify-result" class="of-verify-result" style="display:none"></div>`,

      game_ff: `
        <div class="order-field">
          <label>User ID Free Fire</label>
          <input type="text" id="of-userid" placeholder="Contoh: 12345678" inputmode="numeric"/>
        </div>
        <button class="of-verify-btn" onclick="OrderForm.verifyFF()">🔍 Cek Nickname</button>
        <div id="of-verify-result" class="of-verify-result" style="display:none"></div>`,

      game: `
        <div class="order-field">
          <label>User ID / Username Game</label>
          <input type="text" id="of-userid" placeholder="Masukkan User ID"/>
        </div>`,

      pulsa: `
        <div class="order-field">
          <label>Nomor HP</label>
          <input type="tel" id="of-phone" placeholder="Contoh: 08123456789" inputmode="numeric"/>
        </div>
        <button class="of-verify-btn" onclick="OrderForm.verifyPhone()">🔍 Cek Operator</button>
        <div id="of-verify-result" class="of-verify-result" style="display:none"></div>`,

      data: `
        <div class="order-field">
          <label>Nomor HP</label>
          <input type="tel" id="of-phone" placeholder="Contoh: 08123456789" inputmode="numeric"/>
        </div>
        <button class="of-verify-btn" onclick="OrderForm.verifyPhone()">🔍 Cek Operator</button>
        <div id="of-verify-result" class="of-verify-result" style="display:none"></div>`,

      pln: `
        <div class="order-field">
          <label>ID Pelanggan PLN / Nomor Meter</label>
          <input type="text" id="of-meterid" placeholder="Contoh: 12345678901" inputmode="numeric"/>
        </div>
        <button class="of-verify-btn" onclick="OrderForm.verifyPLN()">🔍 Cek ID Pelanggan</button>
        <div id="of-verify-result" class="of-verify-result" style="display:none"></div>`,

      ewallet: `
        <div class="order-field">
          <label>Nomor HP / Akun E-Wallet</label>
          <input type="tel" id="of-phone" placeholder="Contoh: 08123456789" inputmode="numeric"/>
        </div>
        <button class="of-verify-btn" onclick="OrderForm.verifyPhone()">🔍 Cek Nama Akun</button>
        <div id="of-verify-result" class="of-verify-result" style="display:none"></div>`,

      sosmed: `
        <div class="order-field">
          <label>Link Profil / Postingan</label>
          <input type="url" id="of-link" placeholder="Contoh: https://instagram.com/username"/>
        </div>`,

      manual: null
    };
    return forms[type] || null;
  },

  // Deteksi operator dari nomor HP
  detectOperator: function(phone) {
    var num = phone.replace(/\D/g, '');
    if (num.startsWith('0')) num = '62' + num.substring(1);
    var prefix = num.substring(2, 6);
    var operators = {
      telkomsel: ['0811','0812','0813','0821','0822','0823','0851','0852','0853'],
      indosat: ['0814','0815','0816','0855','0856','0857','0858'],
      xl: ['0817','0818','0819','0859','0877','0878'],
      axis: ['0831','0832','0833','0838'],
      tri: ['0895','0896','0897','0898','0899'],
      smartfren: ['0881','0882','0883','0884','0885','0886','0887','0888','0889'],
      byu: ['0851'],
    };
    var phonePrefix = '0' + num.substring(2, 6);
    for (var op in operators) {
      for (var i = 0; i < operators[op].length; i++) {
        if (phonePrefix.startsWith(operators[op][i])) return op;
      }
    }
    return null;
  },

  verifyPhone: function() {
    var phone = document.getElementById('of-phone').value.trim();
    if (!phone) { alert('Masukkan nomor HP dulu!'); return; }
    var op = this.detectOperator(phone);
    var result = document.getElementById('of-verify-result');
    if (op) {
      var opNames = { telkomsel:'Telkomsel', indosat:'Indosat Ooredoo', xl:'XL Axiata', axis:'Axis', tri:'Tri (3)', smartfren:'Smartfren', byu:'ByU' };
      result.innerHTML = '✅ Operator terdeteksi: <strong>' + (opNames[op] || op) + '</strong>';
      result.style.display = 'block';
      result.style.color = '#22c55e';
      this._data.phone = phone;
      this._data.operator = op;
      this._data.verified = true;
    } else {
      result.innerHTML = '❌ Nomor tidak dikenali, cek kembali';
      result.style.display = 'block';
      result.style.color = '#ef4444';
      this._data.verified = false;
    }
  },

  verifyML: function() {
    var userid = document.getElementById('of-userid').value.trim();
    var zoneid = document.getElementById('of-zoneid').value.trim();
    if (!userid || !zoneid) { alert('Isi User ID dan Zone ID dulu!'); return; }
    var result = document.getElementById('of-verify-result');
    result.innerHTML = '⏳ Mengecek nickname...';
    result.style.display = 'block';
    result.style.color = '#f59e0b';

    fetch('/api/game/verify-ml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid, zoneid })
    })
    .then(r => r.json())
    .then(data => {
      if (data.nickname) {
        result.innerHTML = '✅ Nickname: <strong>' + data.nickname + '</strong>';
        result.style.color = '#22c55e';
        this._data.userid = userid + '(' + zoneid + ')';
        this._data.nickname = data.nickname;
        this._data.verified = true;
      } else {
        result.innerHTML = '❌ ID tidak ditemukan, cek kembali';
        result.style.color = '#ef4444';
        this._data.verified = false;
      }
    })
    .catch(() => {
      result.innerHTML = '❌ Gagal cek, coba lagi';
      result.style.color = '#ef4444';
    });
  },

  verifyFF: function() {
    var userid = document.getElementById('of-userid').value.trim();
    if (!userid) { alert('Isi User ID dulu!'); return; }
    var result = document.getElementById('of-verify-result');
    result.innerHTML = '⏳ Mengecek nickname...';
    result.style.display = 'block';
    result.style.color = '#f59e0b';

    fetch('/api/game/verify-ff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid })
    })
    .then(r => r.json())
    .then(data => {
      if (data.nickname) {
        result.innerHTML = '✅ Nickname: <strong>' + data.nickname + '</strong>';
        result.style.color = '#22c55e';
        this._data.userid = userid;
        this._data.nickname = data.nickname;
        this._data.verified = true;
      } else {
        result.innerHTML = '❌ ID tidak ditemukan, cek kembali';
        result.style.color = '#ef4444';
        this._data.verified = false;
      }
    })
    .catch(() => {
      result.innerHTML = '❌ Gagal cek, coba lagi';
      result.style.color = '#ef4444';
    });
  },

  verifyPLN: function() {
    var meterid = document.getElementById('of-meterid').value.trim();
    if (!meterid) { alert('Isi ID Pelanggan dulu!'); return; }
    var result = document.getElementById('of-verify-result');
    result.innerHTML = '⏳ Mengecek ID Pelanggan...';
    result.style.display = 'block';
    result.style.color = '#f59e0b';

    fetch('/api/pln/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meterid })
    })
    .then(r => r.json())
    .then(data => {
      if (data.name) {
        result.innerHTML = '✅ Nama: <strong>' + data.name + '</strong>';
        result.style.color = '#22c55e';
        this._data.meterid = meterid;
        this._data.name = data.name;
        this._data.verified = true;
      } else {
        result.innerHTML = '❌ ID tidak ditemukan, cek kembali';
        result.style.color = '#ef4444';
        this._data.verified = false;
      }
    })
    .catch(() => {
      result.innerHTML = '❌ Gagal cek, coba lagi';
      result.style.color = '#ef4444';
    });
  },

  // Ambil customer_no sesuai tipe
  getCustomerNo: function(type) {
    if (type === 'game_ml') return document.getElementById('of-userid')?.value + '(' + document.getElementById('of-zoneid')?.value + ')';
    if (type === 'game_ff' || type === 'game') return document.getElementById('of-userid')?.value;
    if (type === 'pulsa' || type === 'data' || type === 'ewallet') return document.getElementById('of-phone')?.value;
    if (type === 'pln') return document.getElementById('of-meterid')?.value;
    if (type === 'sosmed') return document.getElementById('of-link')?.value;
    return '';
  },

  // Submit order
  submit: function(productType, skuCode, price, productName) {
    var customerNo = this.getCustomerNo(productType);
    if (!customerNo) { alert('Lengkapi data order dulu!'); return; }

    // Tipe yang butuh verifikasi
    var needVerify = ['game_ml','game_ff','pulsa','data','pln','ewallet'];
    if (needVerify.includes(productType) && !this._data.verified) {
      alert('Verifikasi data dulu sebelum lanjut bayar!');
      return;
    }

    var numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
    var orderId = 'ORDER-' + Date.now();

    // Simpan data order ke session
    sessionStorage.setItem('pendingOrder', JSON.stringify({
      order_id: orderId,
      sku: skuCode,
      customer_no: customerNo,
      type: productType,
      product: productName,
      price: numericPrice
    }));

    // Buat payment Midtrans
    fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        amount: numericPrice,
        customer_name: 'Pelanggan',
        customer_email: 'pelanggan@email.com',
        item_name: productName,
      }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.token) {
        snap.pay(data.token, {
          onSuccess: function(result) {
            alert('✅ Pembayaran berhasil! Pesanan sedang diproses.');
          },
          onPending: function(result) {
            alert('⏳ Menunggu pembayaran...');
          },
          onError: function(result) {
            alert('❌ Pembayaran gagal, silahkan coba lagi.');
          },
        });
      } else {
        alert('Gagal membuat transaksi, coba lagi.');
      }
    });
  }
};
