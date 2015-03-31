var inputSelector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], textarea';

// Add active on focus
$(document).on('focus', inputSelector, function() {
    $(this).siblings('label').addClass('active');
});
$(document).on('blur', inputSelector, function() {
    if ($(this).val().length === 0 && $(this).attr('placeholder') === undefined) {
        $(this).siblings('label').removeClass('active');
    }
    //validateField($(this));
});

// Add active if form auto complete
$(document).on('change', inputSelector, function () {
    if ($(this).val().length !== 0 || $(this).attr('placeholder') !== undefined) {
        $(this).siblings('label').addClass('active');
    }
    //validateField($(this));
});

// Add active if pre-populated
$(document).ready(function() {
    $(inputSelector).each(function(index, element) {
        if ($(element).val().length > 0 || $(this).attr('placeholder') !== undefined) {
            $(this).siblings('label').addClass('active');
        }
        else {
            $(this).siblings('label').removeClass('active');
        }
    });
});
