
function importFilter(filter) {
  $.ajax({
    type: 'POST',
    url: '/loadFromSearch',
    dataType: 'json',
    data: filter,
    success: (data) => {
      console.log('Loaded photos successfully.');
      if (data.photos && data.photos.length > 0) {
        window.location = '/';
      } else {
        handleError('No images found', 'Try different search parameters.');
      }
      hideLoadingDialog();
    },
    error: (data) => {
      handleError('Couldn\'t load images.', data);
    },
  });
}

$(document).ready(() => {
  $('input[name$=\'dateFilter\']').on('click', (e) => {
    const range = '#rowDateRange';
    const exact = '#rowDateExact';

    switch ($(e.currentTarget).val()) {
      case 'none':
        $(range).hide();
        $(exact).hide();
        break;
      case 'exact':
        $(range).hide();
        $(exact).show();
        break;

      case 'range':
        $(range).show();
        $(exact).hide();
        break;
    }
  });

  $('#filter').on('submit', (e) => {
    e.preventDefault();
    showLoadingDialog();
    importFilter($('#filter').serialize())
  });
});