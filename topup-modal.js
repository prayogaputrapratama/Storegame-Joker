// ============================================
// TOP UP GAME MODAL - Storegame Joker
// Flow: Isi ID → Cek Nickname → Pilih Nominal → Bayar
// ============================================

var TopUpModal = {
  _currentGame: null,
  _currentVariants: [],
  _selectedVariant: null,
  _nickname: null,
  _customerNo: null,

  // Game configs
  games: {
    'ff-diamond': {
      name: 'Free Fire',
      emoji: '🔫',
      idLabel: 'User ID Free Fire',
      idPlaceholder: 'Contoh: 123456789',
      needZone: false,
      skuPrefix: 'ff',
    },
    'ml-diamond': {
      name: 'Mobile Legends',
      emoji: '⚔️',
      idLabel: 'User ID Mobile Legends',
      idPlaceholder: 'Contoh: 12345678',
      needZone: true,
      zonePlaceholder: 'Contoh: 1234',
      skuPrefix: 'ml',
    },
    'pubg-uc': {
      name: 'PUBG Mobile',
      emoji: '🏆',
      idLabel: 'Player ID PUBG Mobile',
      idPlaceholder: 'Contoh: 5123456789',
      needZone: false,
      skuPrefix: 'pubg',
    },
  },

  open: function(gameKey, variants) {
    this._currentGame = gameKey;
    this._currentVariants = variants;
    this._selectedVariant = null;
    this._nickname = null;
    this._customerNo = null;

    var cfg = this.games[gameKey];
    if (!cfg) return;

    // Set header
    document.getElementById('tum-game-name').textContent = cfg.emoji + ' ' + cfg.name;
    document.getElementById('tum-id-label').textContent = cfg.idLabel;
    document.getElementById('tum-userid').placeholder = cfg.idPlaceholder;
    document.getElementById('tum-userid').value = '';

    // Zone ID
    var zoneWrap = document.getElementById('tum-zone-wrap');
    if (cfg.needZone) {
      zoneWrap.style.display = 'block';
      document.getElementById('tum-zoneid').value = '';
      document.getElementById('tum-zoneid').placeholder = cfg.zonePlaceholder || 'Zone ID';
    } else {
      zoneWrap.style.display = 'none';
    }

    // Reset states
    document.getElementById('tum-verify-result').style.display = 'none';
    document.getElementById('tum-verify-result').textContent = '';
    document.getElementById('tum-step2').style.display = 'none';
    document.getElementById('tum-step3').style.display = 'none';
    document.getElementById('tum-nominal-list').innerHTML = '';

    // Show modal
    document.getElementById('topupModalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close: function() {
    document.getElementById('topupModalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  },

  verify: function() {
    var userid = document.getElementById('tum-userid').value.trim();
    var cfg = this.games[this._currentGame];
    if (!userid) { alert('Masukkan ' + cfg.idLabel + ' dulu!'); return; }

    var zoneid = '';
    if (cfg.needZone) {
      zoneid = document.getElementById('tum-zoneid').value.trim();
      if (!zoneid) { alert('Masukkan Zone ID dulu!'); return; }
    }

    this._customerNo = cfg.needZone ? (userid + '(' + zoneid + ')') : userid;

    var resultEl = document.getElementById('tum-verify-result');
    resultEl.textContent = '⏳ Mengecek akun...';
    resultEl.style.display = 'block';
    resultEl.style.color = '#f59e0b';
    resultEl.style.background = 'rgba(245,158,11,0.1)';

    var self = this;
    var endpoint = cfg.needZone ? '/api/game/verify-ml' : '/api/game/verify-ff';
    var body = cfg.needZone
      ? { userid: userid, zoneid: zoneid }
      : { userid: userid };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.nickname) {
        self._nickname = data.nickname;
        resultEl.textContent = '✅ ' + data.nickname;
        resultEl.style.color = '#22c55e';
        resultEl.style.background = 'rgba(34,197,94,0.1)';
        self.showNominal();
      } else {
        // Kalau verify gagal (sandbox), tetap lanjut dengan ID saja
        self._nickname = 'ID: ' + userid;
        resultEl.textContent = '✅ ID: ' + userid + ' (tidak dapat dicek nickname)';
        resultEl.style.color = '#22c55e';
        resultEl.style.background = 'rgba(34,197,94,0.1)';
        self.showNominal();
      }
    })
    .catch(function() {
      // Kalau API error, tetap lanjut
      self._nickname = 'ID: ' + userid;
      resultEl.textContent = '✅ ID: ' + userid;
      resultEl.style.color = '#22c55e';
      resultEl.style.background = 'rgba(34,197,94,0.1)';
      self.showNominal();
    });
  },

  showNominal: function() {
    var step2 = document.getElementById('tum-step2');
    var list = document.getElementById('tum-nominal-list');
    step2.style.display = 'block';
    document.getElementById('tum-step3').style.display = 'none';

    // Filter variants yang valid (punya harga)
    var variants = this._currentVariants.filter(function(v) {
      return v.price && v.price !== '—' && v.name && !v.name.includes('SPESIAL') && !v.name.includes('Harga Segera');
    });

    var self = this;
    list.innerHTML = variants.map(function(v, i) {
      return '<div class="tum-nominal-item" onclick="TopUpModal.selectNominal(' + i + ')" id="tum-nom-' + i + '">' +
        '<div class="tum-nominal-name">' + v.name + '</div>' +
        '<div class="tum-nominal-price">' + v.price + '</div>' +
        (v.badge ? '<span class="tum-nominal-badge">' + v.badge + '</span>' : '') +
      '</div>';
    }).join('');

    this._filteredVariants = variants;

    // Scroll ke step 2
    setTimeout(function() {
      step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  },

  selectNominal: function(idx) {
    // Remove selected dari semua
    var items = document.querySelectorAll('.tum-nominal-item');
    items.forEach(function(el) { el.classList.remove('selected'); });

    document.getElementById('tum-nom-' + idx).classList.add('selected');
    this._selectedVariant = this._filteredVariants[idx];

    // Show step 3
    var step3 = document.getElementById('tum-step3');
    step3.style.display = 'block';
    document.getElementById('tum-selected-name').textContent = this._selectedVariant.name;
    document.getElementById('tum-selected-price').textContent = this._selectedVariant.price;
    document.getElementById('tum-selected-id').textContent = this._nickname || this._customerNo;

    setTimeout(function() {
      step3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  },

  pay: function() {
    if (!this._selectedVariant) { alert('Pilih nominal dulu!'); return; }
    if (!this._customerNo) { alert('Isi ID dulu!'); return; }

    var price = this._selectedVariant.price;
    var numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
    var orderId = 'ORDER-' + Date.now();
    var productName = this.games[this._currentGame].name + ' ' + this._selectedVariant.name;

    var self = this;

    // Simpan pending order
    try {
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        order_id: orderId,
        customer_no: this._customerNo,
        product: productName,
        price: numericPrice,
        game: this._currentGame
      }));
    } catch(e) {}

    // Buat payment Midtrans
    fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        amount: numericPrice,
        customer_name: this._nickname || 'Pelanggan',
        customer_email: 'pelanggan@email.com',
        item_name: productName,
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.token) {
        self.close();
        snap.pay(data.token, {
          onSuccess: function() {
            alert('✅ Pembayaran berhasil! Pesanan sedang diproses.');
          },
          onPending: function() {
            alert('⏳ Menunggu pembayaran...');
          },
          onError: function() {
            alert('❌ Pembayaran gagal, silahkan coba lagi.');
          },
        });
      } else {
        alert('Gagal membuat transaksi: ' + (data.error_messages || JSON.stringify(data)));
      }
    })
    .catch(function(e) {
      alert('Error: ' + e.message);
    });
  }
};
