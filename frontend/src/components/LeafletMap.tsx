import { MapContainer, TileLayer, Popup, MapContainerProps } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";
import { LatLng, Map, Marker, marker } from 'leaflet';
import React, { RefAttributes } from 'react';
import { useMapEvent } from 'react-leaflet';
import axios from 'axios';

const LeafletMap = (props: JSX.IntrinsicAttributes & MapContainerProps & RefAttributes<Map> & {locationTextFieldId: string}) => {

    return (
        <MapContainer {...props} zoom={16} zoomSnap={0.7} style={{ width: "40vw", height: "40vh" }}>
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>
                <ClickMarker locationTextFieldId={props.locationTextFieldId}/>
        </MapContainer>
    );
}

const ClickMarker = ({locationTextFieldId}: {locationTextFieldId: string}) => {
    let clickedMarker: Marker<any> | null = null;
    const map = useMapEvent("click", async (event)=>{
        const coords = event.latlng;
        map.eachLayer((layer)=>{
            if(layer instanceof Marker){
                layer.remove()
            }
        })
        if(clickedMarker == null) {
            clickedMarker = marker(coords).addTo(map);
        } else {
            clickedMarker = marker(coords).addTo(map);
        }

        var config = {
        method: 'get',
        url: `https://api.geoapify.com/v1/geocode/reverse?lat=${coords.lat}&lon=${coords.lng}&apiKey=cac0da3764184118a1b51c0e472ef4a2`,
        headers: { }
        };

        const addressData = (await axios(config)).data.features[0].properties;

        const locationTextField = document.getElementById(locationTextFieldId);
        locationTextField?.setAttribute("value", `${addressData.address_line1} ${addressData.address_line2}`)
    })
    return <div></div>
}

export default LeafletMap