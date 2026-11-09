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
    var isLight = $body.hasClass('theme-light');

    if (isLight) {
      $body.removeClass('theme-light');
    } else {
      $body.addClass('theme-light');
    }

    $(this)
      .attr('aria-pressed', isLight ? 'false' : 'true')
      .find('.theme-toggle__icon').html(isLight ? '☀' : '🌙').end()
      .find('.theme-toggle__label').html(isLight ? 'Modo claro' : 'Modo oscuro');
  });

  /* =======================================================
     1.5) NAVEGACIÓN DEL LOBBY (PANELES)
     ======================================================= */
  var panelActual = null;

  function abrirPanel(nombre) {
    if (!nombre || nombre === 'inicio') {
      cerrarPaneles();
      return;
    }

    var $panel = $('#panel-' + nombre);
    if (!$panel.length) return;

    panelActual = nombre;

    $('.panel').removeClass('is-open').attr('aria-hidden', 'true');
    $panel.addClass('is-open').attr('aria-hidden', 'false');

    $('#panelLayer')
      .attr('aria-hidden', 'false')
      .stop(true, true)
      .css({ display: 'flex', opacity: 0 })
      .animate({ opacity: 1 }, 180);

    $('body').addClass('panel-open');

    $('.rail-btn').removeClass('is-active').attr('aria-pressed', 'false');
    $('.rail-btn[data-panel="' + nombre + '"]')
      .addClass('is-active')
      .attr('aria-pressed', 'true');

    if (nombre === 'galeria') {
      reiniciarAutoplay();
    }

    setTimeout(function () {
      $panel.find('.panel__close').trigger('focus');
    }, 200);
  }

  function cerrarPaneles() {
    panelActual = null;

    $('.panel').removeClass('is-open').attr('aria-hidden', 'true');
    $('#panelLayer')
      .stop(true, true)
      .animate({ opacity: 0 }, 150, function () {
        $(this).css('display', 'none').attr('aria-hidden', 'true');
      });

    $('body').removeClass('panel-open');
    $('.rail-btn').removeClass('is-active').attr('aria-pressed', 'false');
    $('.rail-btn[data-panel="inicio"]')
      .addClass('is-active')
      .attr('aria-pressed', 'true');

    detenerAutoplay();
  }

  $(document).on('click', '[data-open-panel]', function () {
    abrirPanel($(this).data('open-panel'));
  });

  $(document).on('click', '[data-close-panel]', function () {
    cerrarPaneles();
  });

  $('.rail-btn').on('click', function () {
    abrirPanel($(this).data('panel'));
  });

  $('#brandHome').on('click', function (event) {
    event.preventDefault();
    cerrarPaneles();
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

  /* Acordeón de preguntas frecuentes */
  $('.faq-q').on('click', function () {
    var $btn = $(this);
    var $item = $btn.closest('.faq-item');
    var isOpen = $item.hasClass('is-open');

    $('.faq-item').not($item).removeClass('is-open');
    $('.faq-item').not($item).find('.faq-a').slideUp('slow');
    $('.faq-item').not($item).find('.faq-q').attr('aria-expanded', 'false');
    $('.faq-item').not($item).find('.faq-q__sign').text('+');

    $item.toggleClass('is-open');
    $item.find('.faq-a').slideToggle('slow');
    $btn.attr('aria-expanded', isOpen ? 'false' : 'true');
    $btn.find('.faq-q__sign').text(isOpen ? '+' : '−');
  });

  /* =======================================================
     4) SNACKS + RESUMEN EN VIVO
     ======================================================= */
  var snackState = {};
  var bumpTimer = null;

  var precios = {
    'PS5 Pro · Sala A': 12,
    'PS5 Slim · Sala B': 10,
    'Estación Nova': 8,
    'Estación Titan': 12,
    'Estación Pulse': 15
  };

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

  function getTotales() {
    var estacion = $('#estacion').val() || '';
    var precio = precios[estacion] || 0;
    var horas = parseInt($('#horas').val(), 10);

    if (isNaN(horas) || horas < 0) horas = 0;

    var subtotalEstacion = precio * horas;
    var snacks = getSelectedSnacks();

    return {
      estacion: estacion,
      precio: precio,
      horas: horas,
      subtotalEstacion: subtotalEstacion,
      snacks: snacks.items,
      totalSnacks: snacks.total,
      total: subtotalEstacion + snacks.total
    };
  }

  function textoHoras(horas) {
    if (!horas) return '—';
    return horas + (horas === 1 ? ' hora' : ' horas');
  }

  function pintarListaSnacks($contenedor, items, claseVacia, textoVacio) {
    $contenedor.empty();

    if (!items.length) {
      $('<li>').addClass(claseVacia).text(textoVacio).appendTo($contenedor);
      return;
    }

    $.each(items, function (_, item) {
      $('<li>')
        .append($('<span>').text(item.qty + '× ' + item.name))
        .append($('<b>').text('Bs ' + item.subtotal))
        .appendTo($contenedor);
    });
  }

  function updateResumen() {
    var datos = getTotales();
    var personas = $('#personas').val();

    $('#resumenEstacion').text(datos.estacion || '—');
    $('#resumenFecha').text(formatFecha($('#fecha').val()));
    $('#resumenHora').text($('#hora').val() || '—');
    $('#resumenPersonas').text(
      personas ? personas + (personas === '1' ? ' persona' : ' personas') : '—'
    );
    $('#resumenHoras').text(textoHoras(datos.horas));
    $('#resumenPrecio').text('Bs ' + datos.precio);
    $('#resumenSubtotalEstacion').text('Bs ' + datos.subtotalEstacion);
    $('#resumenTotalSnacks').text('Bs ' + datos.totalSnacks);
    $('#resumenTotalGeneral').text('Bs ' + datos.total);
    $('#precioHoraVista').text('Bs ' + datos.precio + ' / hora');

    pintarListaSnacks(
      $('#resumenSnacksLista'),
      datos.snacks,
      'pedido__empty',
      'Sin snacks seleccionados.'
    );

    pintarListaSnacks(
      $('#pedidoSnacksLista'),
      datos.snacks,
      'pedido-lateral__empty',
      'Todavía no elegiste snacks.'
    );

    $('#pedidoSnacksTotal').text('Bs ' + datos.totalSnacks);

    /* Panel lateral del lobby */
    var totalItems = 0;
    $.each(datos.snacks, function (_, item) {
      totalItems += item.qty;
    });

    $('#sideEstacion').text(datos.estacion || 'Sin elegir');
    $('#sideHoras').text(textoHoras(datos.horas));
    $('#sideSnacks').text(totalItems + (totalItems === 1 ? ' ítem' : ' ítems'));
    $('#sideTotal').text('Bs ' + datos.total);

    $('#railSnackCount')
      .text(totalItems)
      .toggleClass('is-on', totalItems > 0);
  }

  updateSnacks();

  /* Horas: botones + / − y límite 1–6 */
  function ajustarHoras(delta) {
    var actual = parseInt($('#horas').val(), 10);
    if (isNaN(actual)) actual = 1;

    var nuevo = Math.min(6, Math.max(1, actual + delta));
    $('#horas').val(nuevo).trigger('change');
  }

  $('#horasMenos').on('click', function () {
    ajustarHoras(-1);
  });

  $('#horasMas').on('click', function () {
    ajustarHoras(1);
  });

  $('#horas').on('input', function () {
    var valor = parseInt(this.value, 10);
    if (!isNaN(valor) && valor > 6) {
      this.value = 6;
    }
  });

  /* Botón "Alquilar hora" de cada tarjeta */
  $('.btn-alquilar').on('click', function () {
    var estacion = $(this).data('estacion');
    var precio = Number($(this).data('precio')) || 0;

    $('#estacion').val(estacion).trigger('change');
    $('#horas').val(1).trigger('change');

    updateResumen();

    mostrarToast(
      '<strong>Estación seleccionada</strong>' +
      estacion + ' · Bs ' + precio + ' / hora',
      'ok'
    );

    abrirPanel('reserva');

    if (window.innerWidth > 900) {
      setTimeout(function () {
        $('#nombre').trigger('focus');
      }, 420);
    }
  });

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
    horas: function (valor) {
      var numero = parseInt(valor, 10);
      if (!valor) return 'Indicá cuántas horas querés reservar.';
      if (isNaN(numero) || numero < 1 || numero > 6) return 'Elegí entre 1 y 6 horas.';
      if (String(numero) !== String(valor).trim()) return 'Usá un número entero de horas.';
      return '';
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

  /* =======================================================
     TOAST FLOTANTE
     ======================================================= */
  var toastTimer = null;

  function mostrarToast(mensaje, tipo) {
    var $toast = $('#toast');

    clearTimeout(toastTimer);
    $toast
      .stop(true, true)
      .removeClass('toast--ok toast--error')
      .addClass(tipo === 'error' ? 'toast--error' : 'toast--ok')
      .html(mensaje)
      .slideDown(250);

    toastTimer = setTimeout(function () {
      $toast.fadeOut(300);
    }, 3000);
  }

  /* =======================================================
     MODAL + CONTADOR DE 30 SEGUNDOS
     ======================================================= */
  var cuentaTimer = null;
  var segundosRestantes = 30;

  function actualizarCuenta() {
    var segundos = Math.max(segundosRestantes, 0);

    $('#modalTimer').text('00:' + (segundos < 10 ? '0' : '') + segundos);
    $('#modalProgress').css('width', ((segundos / 30) * 100) + '%');
    $('#modalTimerBox').toggleClass('is-urgent', segundos <= 10);
  }

  function detenerCuenta() {
    if (cuentaTimer) {
      clearInterval(cuentaTimer);
      cuentaTimer = null;
    }
  }

  function iniciarCuenta() {
    detenerCuenta();
    segundosRestantes = 30;
    actualizarCuenta();

    cuentaTimer = setInterval(function () {
      segundosRestantes--;
      actualizarCuenta();

      if (segundosRestantes <= 0) {
        detenerCuenta();
        cerrarModal();
        mostrarToast(
          '<strong>Tarifa Flash Expirada</strong>' +
          'El tiempo para confirmar terminó. Volvé a intentarlo.',
          'error'
        );
      }
    }, 1000);
  }

  function abrirModal() {
    var datos = getTotales();

    $('#modalEstacion').text(datos.estacion || '—');
    $('#modalHoras').text(textoHoras(datos.horas));
    $('#modalPrecio').text('Bs ' + datos.precio + ' / hora');
    $('#modalSubtotal').text('Bs ' + datos.subtotalEstacion);
    $('#modalTotalSnacks').text('Bs ' + datos.totalSnacks);
    $('#modalTotal').text('Bs ' + datos.total);

    var $lista = $('#modalSnacksLista').empty();

    if (datos.snacks.length) {
      $.each(datos.snacks, function (_, item) {
        $('<li>')
          .append($('<span>').text(item.qty + '× ' + item.name))
          .append($('<b>').text('Bs ' + item.subtotal))
          .appendTo($lista);
      });
    } else {
      $('<li>')
        .addClass('modal__snacks-empty')
        .text('Sin snacks seleccionados.')
        .appendTo($lista);
    }

    $('#modalReserva').fadeIn(200).attr('aria-hidden', 'false');
    $('body').addClass('modal-open');
    $('#modalConfirmar').trigger('focus');
    iniciarCuenta();
  }

  function cerrarModal() {
    detenerCuenta();
    $('#modalReserva').fadeOut(200).attr('aria-hidden', 'true');
    $('body').removeClass('modal-open');
  }

  $('#modalCerrar, #modalCancelar').on('click', cerrarModal);
  $('#modalBackdrop').on('click', cerrarModal);

  $(document).on('keydown', function (event) {
    if (event.key !== 'Escape') return;

    if ($('#modalReserva').is(':visible')) {
      cerrarModal();
    } else if (panelActual) {
      cerrarPaneles();
    }
  });

  $('#modalConfirmar').on('click', function () {
    var total = $('#modalTotal').text();
    cerrarModal();
    mostrarToast(
      '<strong>Reserva confirmada</strong>' +
      'Total: ' + total + ' · ¡Te esperamos en Kalizdy Game!',
      'ok'
    );
  });

  $('#reservaForm').on('submit', function (event) {
    event.preventDefault();

    var invalidos = validarFormulario();

    if (invalidos.length) {
      $('#formError')
        .text(invalidos.length === 1
          ? 'Revisá el campo marcado para continuar.'
          : 'Revisá los ' + invalidos.length + ' campos marcados para continuar.')
        .fadeIn(150);

      var $primero = $('#' + invalidos[0]);
      var $panelBody = $primero.closest('.panel__body');

      if ($panelBody.length) {
        var destino = $primero.offset().top - $panelBody.offset().top + $panelBody.scrollTop() - 80;
        $panelBody.stop(true).animate({ scrollTop: Math.max(destino, 0) }, 300);
      }

      $primero.trigger('focus');
      return;
    }

    $('#formError').hide().text('');
    updateResumen();
    abrirModal();
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
      $('#horas').val(1);

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
    if (reduceMotion || panelActual !== 'galeria') return;
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
