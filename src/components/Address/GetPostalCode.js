const GetPostalCode = async placeId =>
  new Promise((resolve, reject) => {
    if (!placeId) reject("placeId not provided")

    try {
      new window.google.maps.places.PlacesService(
        document.createElement("div")
      ).getDetails(
        {
          placeId,
          fields: ["address_components"],
        },
        details => {
          return resolve(details)
        }
      )
    } catch (e) {
      reject(e)
    }
  })
export default GetPostalCode;