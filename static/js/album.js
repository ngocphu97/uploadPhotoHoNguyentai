// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Notifies the backend to load an album into the photo frame queue.
// If the request is successful, the photo frame queue is opened,
// otherwise an error message is shown.
function loadFromAlbum(name, id) {
  showLoadingDialog();
  // Make an ajax request to the backend to load from an album.
  $.ajax({
    type: 'POST',
    url: '/loadFromAlbum',
    dataType: 'json',
    data: {albumId: id},
    success: (data) => {
      console.log('Albums imported:' + JSON.stringify(data.parameters));
      if (data.photos && data.photos.length) {
        // Photos were loaded from the album, open the photo frame preview
        // queue.
        window.location = '/';
      } else {
        // No photos were loaded. Display an error.
        handleError('Couldn\'t import album', 'Album is empty.');
      }
      hideLoadingDialog();
    },
    error: (data) => {
      handleError('Couldn\'t import album', data);
    }
  });
}

// Loads a list of all albums owned by the logged in user from the backend.
// The backend returns a list of albums from the Library API that is rendered
// here in a list with a cover image, title and a link to open it in Google
// Photos.
function listAlbums() {
  hideError();
  showLoadingDialog();
  $('#albums').empty();

  $.ajax({
    type: 'GET',
    url: '/getAlbums',
    dataType: 'json',
    success: (data) => {
      console.log('Loaded albums: ' + data.albums);
      $.each(data.albums, (i, item) => {
        const thumbnailUrl = `${item.coverPhotoBaseUrl}=w100-h100`;

        const materialDesignLiteList =
            $('<li />').addClass('mdl-list__item mdl-list__item--two-line');

        const primaryContentRoot =
            $('<div />').addClass('mdl-list__item-primary-content');
        materialDesignLiteList.append(primaryContentRoot);

        const primaryContentImage = $('<img />')
                                        .attr('src', thumbnailUrl)
                                        .attr('alt', item.title)
                                        .addClass('mdl-list__item-avatar');
        primaryContentRoot.append(primaryContentImage);

        const primaryContentTitle = $('<div />').text(item.title);
        primaryContentRoot.append(primaryContentTitle);

        const primaryContentSubTitle =
            $('<div />')
                .text(`(${item.mediaItemsCount} items)`)
                .addClass('mdl-list__item-sub-title');
        primaryContentRoot.append(primaryContentSubTitle);

        const secondaryContentRoot =
            $('<div />').addClass('mdl-list__item-secondary-action');
        materialDesignLiteList.append(secondaryContentRoot);

        const linkToAddToPhotoFrame = $('<a />')
                                          .addClass('album-title')
                                          .attr('data-id', item.id)
                                          .attr('data-title', item.title);
        secondaryContentRoot.append(linkToAddToPhotoFrame);

        const addToPhotoFrameButton =
            $('<button />')
                .addClass(
                    'mdl-button mdl-js-button mdl-button--raised mdl-button--accent')
                .text('Add to frame');
        linkToAddToPhotoFrame.append(addToPhotoFrameButton);

        const linkToGooglePhotos =
            $('<a />').attr('target', '_blank').attr('href', item.productUrl);
        secondaryContentRoot.append(linkToGooglePhotos);

        // The button for the 'open in Google Photos' link.
        const googlePhotosButton = $('<button />')
                                       .addClass('gp-button raised')
                                       .text('Open in Google Photos');
        linkToGooglePhotos.append(googlePhotosButton);

        // Add the list item to the list of albums.
        $('#albums').append(materialDesignLiteList);
      });

      hideLoadingDialog();
      console.log('Albums loaded.');
    },
    error: (data) => {
      hideLoadingDialog();
      handleError('Couldn\'t load albums', data);
    }
  });
}

$(document).ready(() => {
  // Load the list of albums from the backend when the page is ready.
  listAlbums();

  // Clicking the 'add to frame' button starts an import request.
  $('#albums').on('click', '.album-title', (event) => {
    const target = $(event.currentTarget);
    const albumId = target.attr('data-id');
    const albumTitle = target.attr('data-title');

    console.log('Importing album: ' + albumTitle);

    loadFromAlbum(albumTitle, albumId);
  });
});