document.addEventListener('DOMContentLoaded', function () {
    
    let isScormConnected = false;

    document.addEventListener('DOMContentLoaded', function () {
        if (window.pipwerks && pipwerks.SCORM) {
            isScormConnected = pipwerks.SCORM.init();
            console.log('[SCORM] connected:', isScormConnected);
        } else {
            console.warn('[SCORM] Wrapper not found');
        }
    });
    /* ===============================
       תפריט מובייל
    =============================== */
    const btnToggle  = document.getElementById('navToggle');
    const btnClose   = document.getElementById('navClose');
    const mobileMenu = document.getElementById('mobileMenu');

    if (btnToggle && mobileMenu) {
        function openMenu() {
            mobileMenu.classList.add('open');
            mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            mobileMenu.classList.remove('open');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        btnToggle.addEventListener('click', openMenu);
        if (btnClose) btnClose.addEventListener('click', closeMenu);

        mobileMenu.addEventListener('click', function (e) {
            if (e.target === mobileMenu) closeMenu();
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    /* ===============================
       חיפוש יחידות תוכן 
    =============================== */
    const searchInput   = document.getElementById('heroSearchInput');
    const unitCards     = document.querySelectorAll('.unit-card');
    const noResultsEl   = document.getElementById('unitsNoResults');
    const unitsSection  = document.getElementById('units');
    const unitsTitle    = unitsSection ? unitsSection.querySelector('.section-title') : null;
    const unitsSubtitle = unitsSection ? unitsSection.querySelector('.section-subtitle') : null;

    if (noResultsEl) noResultsEl.style.display = 'none';

    if (searchInput && unitCards.length) {
        searchInput.addEventListener('input', function () {
            const query = searchInput.value.trim().toLowerCase();
            let anyVisible = false;

            unitCards.forEach(card => {
                const col = card.closest('.col-12');
                if (!col) return;

                if (!query) {
                    col.style.display = '';
                    anyVisible = true;
                    return;
                }

                const text = card.innerText.toLowerCase();
                const match = text.includes(query);
                col.style.display = match ? '' : 'none';
                if (match) anyVisible = true;
            });

            if (noResultsEl) noResultsEl.style.display = anyVisible ? 'none' : 'block';
            if (unitsTitle) unitsTitle.style.display = anyVisible ? '' : 'none';
            if (unitsSubtitle) unitsSubtitle.style.display = anyVisible ? '' : 'none';
        });
        const heroSearchForm = document.getElementById('heroSearchForm');

        if (heroSearchForm) {
            heroSearchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                searchInput.dispatchEvent(new Event('input'));
            });
        }

    }

    /* ===============================
       דרופדאון
    =============================== */
    const subjectSelect  = document.getElementById('subjectSelect');
    const subjectTrigger = subjectSelect ? subjectSelect.querySelector('.custom-select-trigger') : null;
    const subjectOptions = subjectSelect ? subjectSelect.querySelector('.custom-options') : null;
    const hiddenSubject  = document.getElementById('contactSubject'); // אם אין לך – עדיין יעבוד

    if (subjectSelect && subjectTrigger && subjectOptions) {

        function openSelect() {
            subjectSelect.classList.add('open');
            subjectSelect.setAttribute('aria-expanded', 'true');
        }

        function closeSelect() {
            subjectSelect.classList.remove('open');
            subjectSelect.setAttribute('aria-expanded', 'false');
        }

        subjectSelect.addEventListener('click', function (e) {
            e.stopPropagation();
            subjectSelect.classList.contains('open') ? closeSelect() : openSelect();
        });

        subjectOptions.querySelectorAll('.custom-option').forEach(option => {
            option.addEventListener('click', function (e) {
                e.stopPropagation();

                const value = (option.textContent || '').trim();
                subjectTrigger.textContent = value;

                if (hiddenSubject) hiddenSubject.value = value; // ל-SCORM בעתיד
                closeSelect();
            });
        });

        document.addEventListener('click', closeSelect);
    }

    /* ===============================
       טוסט + טופס צור קשר
    =============================== */
    const contactForm  = document.getElementById('contactForm');
    const contactToast = document.getElementById('contactToast');

    function showContactToast() {
        if (!contactToast) return;
        contactToast.classList.add('show');
        setTimeout(() => contactToast.classList.remove('show'), 3000);
    }

    if (contactToast) contactToast.classList.remove('show');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const payload = {
                subject: subjectTrigger ? subjectTrigger.textContent.trim() : '',
                name:    document.getElementById('contactName')?.value.trim() || '',
                phone:   document.getElementById('contactPhone')?.value.trim() || '',
                message: document.getElementById('contactMessage')?.value.trim() || ''
            };

            if (isScormConnected) {
                const index = parseInt(
                    pipwerks.SCORM.get('cmi.interactions._count') || '0',
                    10
                );

                pipwerks.SCORM.set(`cmi.interactions.${index}.id`, 'contact_form');
                pipwerks.SCORM.set(`cmi.interactions.${index}.type`, 'other');
                pipwerks.SCORM.set(
                    `cmi.interactions.${index}.student_response`,
                    JSON.stringify(payload)
                );
                pipwerks.SCORM.set(`cmi.interactions.${index}.result`, 'neutral');

                pipwerks.SCORM.save();
            }


            contactForm.reset();

            if (subjectTrigger) subjectTrigger.textContent = 'בחר נושא';
            if (hiddenSubject) hiddenSubject.value = '';

            showContactToast();
        });
    }

});
