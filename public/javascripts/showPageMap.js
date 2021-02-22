     mapboxgl.accessToken = mapToken; //mapToken var in show.ejs
     const map = new mapboxgl.Map({
         container: 'map', // container ID
         style: 'mapbox://styles/mapbox/streets-v11', // style of the map URL
         center: campground.geometry.coordinates, // starting position [lng, lat], const campground in show.ejs
         zoom: 9 // starting zoom
     });

     map.addControl(new mapboxgl.NavigationControl()) //map controls


     new mapboxgl.Marker()
        .setLngLat(campground.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({offset: 25})
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
        )
        .addTo(map)


        //rest of the code = server side => controllers/campgrounds.js