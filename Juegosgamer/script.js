/* =========================================================
   KALIZDY GAME — PS5 & PC GAMER
   Diseño Web II · UPDS 2026
   jQuery 3.7.1 · DOM, filtros, acordeón, carrusel y validación
   ========================================================= */

$(function () {
  'use strict';

  /* =======================================================
     0) RELOJ HUD
     ======================================================= */
  function dosDigitos(numero) {
    return numero < 10 ? '0' + numero : String(numero);
  }

  function actualizarReloj() {
    var ahora = new Date();
    $('#reloj').text(
      dosDigitos(ahora.getHours()) + ':' +
      dosDigitos(ahora.getMinutes()) + ':' +
      dosDigitos(ahora.getSeconds())
    );
  }

  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  /* =======================================================
     1) THEME TOGGLE (modo oscuro / claro)
     ======================================================= */
  $('#themeToggle').on('click', function () {
    var $body = $('body');
    $body.toggleClass('theme-light');

    var isLight = $body.hasClass('theme-light');
    $(this)
      .attr('aria-pressed', isLight ? 'true' : 'false')
      .find('.theme-toggle__icon').text(isLight ? '🌙' : '☀').end()
      .find('.theme-toggle__label').text(isLight ? 'Modo oscuro' : 'Modo claro');
  });

  /* =======================================================
     2) SELECTOR DE CONSOLAS (PS5 / PC GAMER)
     fadeOut() / fadeIn() + addClass() / removeClass() + .html()
     ======================================================= */
  var zonas = {
    all: { icon: '🎲', label: 'Todas las estaciones' },
    ps5: { icon: '🎮', label: 'PS5' },
    pc:  { icon: '🖥', label: 'PC Gamer' }
  };

  $('.btn-console').on('click', function () {
    var cat = $(this).data('cat');
    var zona = zonas[cat] || zonas.all;

    $('.btn-console')
      .removeClass('is-active')
      .attr('aria-pressed', 'false');
    $(this).addClass('is-active').attr('aria-pressed', 'true');

    $('#consolas')
      .removeClass('zona-all zona-ps5 zona-pc')
      .addClass('zona-' + cat);

    $('#zonaIcon').html(zona.icon);
    $('#zonaLabel').text(zona.label);

    var $cards = $('.equipo-card');
    $cards.stop(true, true).fadeOut(180).promise().done(function () {
      if (cat === 'all') {
        $cards.fadeIn(320);
      } else {
        $cards.filter('[data-cat="' + cat + '"]').fadeIn(320);
      }
    });
  });

  /* =======================================================
     3) ACORDEÓN DE FICHAS TÉCNICAS
     ======================================================= */
  $('.btn-detalles').on('click', function () {
    var $btn = $(this);
    var $card = $btn.closest('.equipo-card');
    var $panel = $card.find('.equipo-detalles');
    var isOpen = $card.hasClass('is-open');

    $('.equipo-card').not($card).removeClass('is-open');
    $('.equipo-card').not($card).find('.equipo-detalles').slideUp('slow');
    $('.btn-detalles').not($btn).attr('aria-expanded', 'false');
    $('.btn-detalles').not($btn).find('.btn-detalles__sign').text('+');

    $panel.slideToggle('slow');
    $card.toggleClass('is-open');
    $btn.attr('aria-expanded', isOpen ? 'false' : 'true');
    $btn.find('.btn-detalles__sign').text(isOpen ? '+' : '−');
  });

  /* =======================================================
     4) SNACKS + RESUMEN EN VIVO
     ======================================================= */
  var snackState = {};
  var bumpTimer = null;

  $('.snack').each(function () {
    snackState[$(this).data('id')] = 0;
  });

  function getSelectedSnacks() {
    var items = [];
    var total = 0;

    $('.snack').each(function () {
      var $snack = $(this);
      var id = $snack.data('id');
      var qty = snackState[id] || 0;
      var price = Number($snack.data('price')) || 0;

      if (qty > 0) {
        items.push({
          name: $snack.find('.snack__info h3').text(),
          qty: qty,
          price: price,
          subtotal: qty * price
        });
        total += qty * price;
      }
    });

    return { items: items, total: total };
  }

  function updateSnacks() {
    var items = 0;
    var total = 0;

    $('.snack').each(function () {
      var $snack = $(this);
      var id = $snack.data('id');
      var price = Number($snack.data('price')) || 0;
      var qty = snackState[id] || 0;

      items += qty;
      total += qty * price;

      $snack.find('[data-qty]').text(qty);
      $snack.toggleClass('is-selected', qty > 0);
      $snack.find('[data-action="minus"]').prop('disabled', qty === 0);
    });

    $('#snackCount').text(items);
    $('#snackTotal').text('Bs ' + total);

    var $summary = $('.snack-summary');
    $summary.addClass('is-bump');
    clearTimeout(bumpTimer);
    bumpTimer = setTimeout(function () {
      $summary.removeClass('is-bump');
    }, 260);

    updateResumen();
  }

  $('.qty-btn').on('click', function () {
    var $snack = $(this).closest('.snack');
    var id = $snack.data('id');
    var action = $(this).data('action');
    var qty = snackState[id] || 0;

    if (action === 'plus' && qty < 10) {
      snackState[id] = qty + 1;
    } else if (action === 'minus' && qty > 0) {
      snackState[id] = qty - 1;
    }

    updateSnacks();
  });

  /* =======================================================
     5) FECHAS + RESUMEN DE RESERVA
     ======================================================= */
  function fechaISO(fecha) {
    return fecha.getFullYear() + '-' +
      dosDigitos(fecha.getMonth() + 1) + '-' +
      dosDigitos(fecha.getDate());
  }

  function formatFecha(valor) {
    if (!valor) return '—';
    var partes = valor.split('-');
    return partes.length === 3 ? partes[2] + '/' + partes[1] + '/' + partes[0] : valor;
  }

  var hoy = new Date();
  var fechaMaxima = new Date();
  fechaMaxima.setDate(fechaMaxima.getDate() + 90);

  $('#fecha')
    .attr('min', fechaISO(hoy))
    .attr('max', fechaISO(fechaMaxima));

  function updateResumen() {
    $('#resumenEstacion').text($('#estacion').val() || '—');
    $('#resumenFecha').text(formatFecha($('#fecha').val()));
    $('#resumenHora').text($('#hora').val() || '—');

    var personas = $('#personas').val();
    $('#resumenPersonas').text(
      personas ? personas + (personas === '1' ? ' persona' : ' personas') : '—'
    );

    var snacks = getSelectedSnacks();
    var textoSnacks = snacks.items.length
      ? $.map(snacks.items, function (item) { return item.qty + '× ' + item.name; }).join(', ')
      : 'Ninguno';

    $('#resumenSnacks').text(textoSnacks);
    $('#resumenTotal').text('Bs ' + snacks.total).addClass('is-accent');
  }

  updateSnacks();

  /* =======================================================
     6) VALIDACIÓN COMPLETA DEL FORMULARIO
     ======================================================= */
  var reglas = {
    nombre: function (valor) {
      if (!valor) return 'Ingresá tu nombre.';
      if (valor.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      if (valor.length > 40) return 'El nombre no puede pasar de 40 caracteres.';
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/.test(valor)) return 'Usá solo letras y espacios.';
      return '';
    },
    celular: function (valor) {
      if (!valor) return 'Ingresá tu celular.';
      var limpio = valor.replace(/\D/g, '');
      if (!/^(?:591)?[0-9]{8}$/.test(limpio)) {
        return 'Ingresá 8 dígitos (o 591 + 8 dígitos). Solo números.';
      }
      return '';
    },
    estacion: function (valor) {
      return valor ? '' : 'Elegí una estación.';
    },
    fecha: function (valor) {
      if (!valor) return 'Elegí una fecha.';
      if (valor < fechaISO(hoy)) return 'La fecha no puede ser anterior a hoy.';
      if (valor > fechaISO(fechaMaxima)) return 'Elegí una fecha dentro de los próximos 90 días.';
      return '';
    },
    hora: function (valor) {
      if (!valor) return 'Elegí una hora.';
      if (valor < '14:00' || valor > '22:00') return 'El horario de reservas es de 14:00 a 22:00.';
      return '';
    },
    personas: function (valor) {
      var numero = parseInt(valor, 10);
      if (!numero || numero < 1 || numero > 6) return 'Elegí entre 1 y 6 personas.';
      return '';
    }
  };

  function valorCampo(nombre) {
    return $.trim(String($('#' + nombre).val() || ''));
  }

  function setFieldError(nombre, mensaje) {
    var $campo = $('#' + nombre);
    var $error = $('[data-error-for="' + nombre + '"]');

    $campo
      .toggleClass('is-invalid', Boolean(mensaje))
      .attr('aria-invalid', mensaje ? 'true' : 'false');

    $error
      .text(mensaje)
      .toggleClass('is-visible', Boolean(mensaje));

    return !mensaje;
  }

  function validarCampo(nombre) {
    var mensaje = reglas[nombre](valorCampo(nombre));
    return setFieldError(nombre, mensaje);
  }

  function validarFormulario() {
    var invalidos = [];

    $.each(reglas, function (nombre) {
      if (!validarCampo(nombre)) {
        invalidos.push(nombre);
      }
    });

    return invalidos;
  }

  /* Restricción de escritura:
     celular = solo dígitos · nombre = solo letras */
  $('#celular').on('keydown', function (event) {
    if (event.ctrlKey || event.metaKey) return;
    if (event.key.length === 1 && !/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  });

  $('#celular').on('input', function () {
    var limpio = this.value.replace(/\D/g, '').slice(0, 11);
    if (this.value !== limpio) {
      this.value = limpio;
    }
  });

  $('#nombre').on('keydown', function (event) {
    if (event.ctrlKey || event.metaKey) return;
    if (event.key.length === 1 && /[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  });

  $('#nombre').on('input', function () {
    var limpio = this.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]/g, '');
    if (this.value !== limpio) {
      this.value = limpio;
    }
  });

  function buildConfirmacion(data, snacks) {
    var $ok = $('#reservaOk').empty();

    $('<p>').addClass('ok-title').text('// Reserva confirmada').appendTo($ok);

    var $lista = $('<ul>').addClass('ok-list');
    var filas = [
      ['Nombre', data.nombre],
      ['Celular', data.celular],
      ['Estación', data.estacion],
      ['Fecha', formatFecha(data.fecha)],
      ['Hora', data.hora],
      ['Personas', data.personas]
    ];

    $.each(filas, function (_, fila) {
      $('<li>')
        .append($('<span>').text(fila[0]))
        .append($('<strong>').text(fila[1]))
        .appendTo($lista);
    });

    $lista.appendTo($ok);

    if (snacks.items.length) {
      $('<p>').addClass('ok-title').css('margin-top', '12px').text('// Snacks').appendTo($ok);

      var $snacks = $('<ul>').addClass('ok-snacks');
      $.each(snacks.items, function (_, item) {
        $('<li>')
          .append($('<span>').text(item.qty + '× ' + item.name))
          .append($('<b>').text('Bs ' + item.subtotal))
          .appendTo($snacks);
      });
      $snacks.appendTo($ok);

      $('<p>').addClass('ok-total')
        .append($('<span>').text('Total snacks'))
        .append($('<strong>').text('Bs ' + snacks.total))
        .appendTo($ok);
    }

    $('<p>').addClass('ok-note')
      .text('Revisá los datos y enviá la reserva por WhatsApp para confirmarla.')
      .appendTo($ok);

    var lineas = [
      'Hola Kalizdy Game, quiero confirmar esta reserva:',
      'Nombre: ' + data.nombre,
      'Celular: ' + data.celular,
      'Estación: ' + data.estacion,
      'Fecha: ' + formatFecha(data.fecha),
      'Hora: ' + data.hora,
      'Personas: ' + data.personas
    ];

    if (snacks.items.length) {
      lineas.push('Snacks:');
      $.each(snacks.items, function (_, item) {
        lineas.push('- ' + item.qty + 'x ' + item.name + ' (Bs ' + item.subtotal + ')');
      });
      lineas.push('Total snacks: Bs ' + snacks.total);
    }

    var url = 'https://wa.me/59175867586?text=' + encodeURIComponent(lineas.join('\n'));

    $('<a>')
      .addClass('btn btn--block ok-wa')
      .attr({ href: url, target: '_blank', rel: 'noopener' })
      .text('Enviar reserva por WhatsApp')
      .appendTo($ok);

    $ok.slideDown('slow', function () {
      $('html, body').stop(true).animate({
        scrollTop: Math.max($ok.offset().top - 130, 0)
      }, 300);
    });
  }

  $('#reservaForm').on('submit', function (event) {
    event.preventDefault();

    $('#reservaOk').slideUp(150);

    var invalidos = validarFormulario();

    if (invalidos.length) {
      $('#formError')
        .text(invalidos.length === 1
          ? 'Revisá el campo marcado para continuar.'
          : 'Revisá los ' + invalidos.length + ' campos marcados para continuar.')
        .fadeIn(150);

      var $primero = $('#' + invalidos[0]);
      $('html, body').stop(true).animate({
        scrollTop: Math.max($primero.offset().top - 130, 0)
      }, 300);
      $primero.trigger('focus');
      return;
    }

    $('#formError').hide().text('');

    var data = {
      nombre: valorCampo('nombre'),
      celular: valorCampo('celular').replace(/[\s.-]/g, ''),
      estacion: valorCampo('estacion'),
      fecha: valorCampo('fecha'),
      hora: valorCampo('hora'),
      personas: valorCampo('personas')
    };

    buildConfirmacion(data, getSelectedSnacks());
  });

  $('#reservaForm').on('input change', 'input, select', function () {
    updateResumen();

    if ($(this).hasClass('is-invalid')) {
      validarCampo(this.id);
    }

    if (!$('.field .is-invalid').length) {
      $('#formError').hide();
    }
  });

  $('#reservaForm').on('focusout', 'input, select', function () {
    if ($(this).val()) {
      validarCampo(this.id);
    }
  });

  $('#reservaForm').on('reset', function () {
    setTimeout(function () {
      $.each(reglas, function (nombre) {
        setFieldError(nombre, '');
      });

      $('#formError').hide().text('');
      $('#reservaOk').slideUp(150).empty();

      $.each(snackState, function (id) {
        snackState[id] = 0;
      });

      updateSnacks();
      updateResumen();
    }, 0);
  });

  /* =======================================================
     7) CARRUSEL DE IMÁGENES
     ======================================================= */
  var $slides = $('.slide');
  var totalSlides = $slides.length;
  var slideActual = 0;
  var autoplay = null;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#slideTotal').text(dosDigitos(totalSlides));

  $slides.each(function (indice) {
    $('<button>')
      .attr({
        type: 'button',
        class: 'carrusel__dot' + (indice === 0 ? ' is-active' : ''),
        'aria-label': 'Ir a la imagen ' + (indice + 1)
      })
      .on('click', function () {
        irASlide(indice);
        reiniciarAutoplay();
      })
      .appendTo('#carruselDots');
  });

  function actualizarCarrusel() {
    $('#slideActual').text(dosDigitos(slideActual + 1));

    $('.carrusel__dot')
      .removeClass('is-active')
      .eq(slideActual)
      .addClass('is-active');

    $('#carruselProgress').css(
      'width',
      (((slideActual + 1) / totalSlides) * 100) + '%'
    );

    $slides.each(function (indice) {
      $(this).attr('aria-hidden', indice === slideActual ? 'false' : 'true');
    });
  }

  function irASlide(indice) {
    var destino = (indice + totalSlides) % totalSlides;

    if (destino === slideActual) {
      actualizarCarrusel();
      return;
    }

    var $saliente = $slides.eq(slideActual).removeClass('is-active');
    var $entrante = $slides.eq(destino).addClass('is-active');

    $saliente.stop(true, true).fadeOut(280);
    $entrante.stop(true, true).fadeIn(420);

    slideActual = destino;
    actualizarCarrusel();
  }

  function detenerAutoplay() {
    if (autoplay) {
      clearInterval(autoplay);
      autoplay = null;
    }
  }

  function iniciarAutoplay() {
    if (reduceMotion) return;
    detenerAutoplay();
    autoplay = setInterval(function () {
      irASlide(slideActual + 1);
    }, 6000);
  }

  function reiniciarAutoplay() {
    detenerAutoplay();
    iniciarAutoplay();
  }

  $('#prevSlide').on('click', function () {
    irASlide(slideActual - 1);
    reiniciarAutoplay();
  });

  $('#nextSlide').on('click', function () {
    irASlide(slideActual + 1);
    reiniciarAutoplay();
  });

  $('#carrusel')
    .attr('tabindex', '0')
    .on('mouseenter focusin', detenerAutoplay)
    .on('mouseleave focusout', iniciarAutoplay)
    .on('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        irASlide(slideActual - 1);
        reiniciarAutoplay();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        irASlide(slideActual + 1);
        reiniciarAutoplay();
      }
    });

  actualizarCarrusel();
  iniciarAutoplay();

  console.log('%cKalizdy Game · sistema listo 🎮', 'color:#00e5ff;font-weight:bold');
});
