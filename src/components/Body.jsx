import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, push, set, onValue } from "firebase/database";  // Import Firebase functions
import { database } from '../firebase';  // Import initialized database

const Body = () => {


    const [CurrentNGOData, setCurrentNGOData] = useState(0);
    const [CurrentNGONonVerifyData, setCurrentNGONonVerifyData] = useState(0);
    const [CurrentDonationNGOData, setCurrentDonationNGOData] = useState(0);
    const [newData, setNewData] = useState([]); // Will store NGO form data as an array
    const [newDonationData, setNewDonationData] = useState([]); // Will store Donation form data as an array
    const [newKeyValue, setNewKeyValue] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);


    useEffect(() => {
        const db = getDatabase();

        // Fetch NGO_DATA count from 'DataToVerify' node
        const ngoVerifyedData = ref(db, 'NGO_DATA');
        onValue(ngoVerifyedData, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setCurrentNGOData(Object.keys(data).length);
            } else {
                // Node doesn't exist, so set count to 0
                setCurrentNGOData(0);
            }
        }, (error) => {
            console.error("Error fetching NGO data:", error);
            // Handle error (e.g., set fallback value)
            setCurrentNGOData(0);
        });
    }, []);


    useEffect(() => {
        const db = getDatabase();

        // Fetch NGO_DATA count from 'DataToVerify' node
        const ngoNonVerifyData = ref(db, 'DataToVerify');
        onValue(ngoNonVerifyData, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setCurrentNGONonVerifyData(Object.keys(data).length);
            } else {
                // Node doesn't exist, so set count to 0
                setCurrentNGONonVerifyData(0);
            }
        }, (error) => {
            console.error("Error fetching NGO data:", error);
            // Handle error (e.g., set fallback value)
            setCurrentNGONonVerifyData(0);
        });
    }, []);



    useEffect(() => {
        // Calculate newKeyValue after fetching data
        setNewKeyValue(CurrentNGOData + CurrentDonationNGOData + 1);
    }, [CurrentNGOData, CurrentDonationNGOData]);

    // Handle NGO form data and store it in an array
    const handleNGOChange = (event) => {
        const { name, value } = event.target;
        setNewData((prevData) => {
            const updatedData = [...prevData]; // Clone previous NGO data array
            updatedData[name] = value; // Store values based on the order of inputs
            return updatedData;
        });

        
    };

    // Handle Donation form data and store it in an array
    const handleSubmitNGO = (event) => {
        event.preventDefault();
        const db = getDatabase();

        // Reference to the DataToVerify node
        const dataToVerifyRef = ref(db, 'DataToVerify');

        // Fetch all existing keys once (not using onValue to avoid persistent listening)
        get(dataToVerifyRef)
            .then((snapshot) => {
                let existingKeys = [];

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    // Extract existing keys as numbers (e.g., 'NGO_Finder_Data_16' -> 16)
                    existingKeys = Object.keys(data)
                        .map(key => parseInt(key.split('_').pop())) // Extract the numeric part of the key
                        .filter(key => !isNaN(key)) // Filter out any non-number keys just in case
                        .sort((a, b) => a - b); // Sort the keys in ascending order
                }

                let nextAvailableKey;

                // If DataToVerify is empty or NaN
                if (existingKeys.length === 0) {
                    // Set the new key based on CurrentNGOData + 1
                    nextAvailableKey = CurrentNGOData + 1;
                } else {
                    // Get the last key (highest value) and increment by 1
                    nextAvailableKey = Math.max(...existingKeys) + 1;
                }

                // Generate the new key with the next available number
                const newKey = `NGO_Finder_Data_${nextAvailableKey}`;

                console.log(`Generated newKey: ${newKey}`);

                // Save the NGO data array in Firebase under DataToVerify
                set(ref(db, `DataToVerify/${newKey}`), newData)
                    .then(() => {
                        console.log("Data Added Successfully");
                        // Show success message
                        setIsSubmitted(true);

                        // Optionally hide the message after a few seconds
                        setTimeout(() => setIsSubmitted(false), 3000);

                    
                    })
                    .catch(error => {
                        console.error("Error adding data:", error);
                    });

            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };


    // Handle Donation form submission
    const handleSubmitDonation = (event) => {
        event.preventDefault();
        const db = getDatabase();

        // Create a new unique key based on newKeyValue for Donation data
        const newKey = newKeyValue;

        // Save the Donation data array in Firebase under DonationDataToVerify
        set(ref(db, `DonationDataToVerify/${newKey}`), newDonationData);
    };

    return (
        <>
            <div className='flex flex-col justify-around md:flex-row sm:flex-col'>
                {/* Form 1: NGO Details */}
                <div>
                    <form className='px-3 py-3' onSubmit={handleSubmitNGO} id='NGODataForm'>
                        <h6 className="mt-1 text-sm leading-6 text-gray-600 ">
                            NGO Details. This information will be displayed publicly so be careful what you share.
                        </h6>

                        {/* NGO Name */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="name" className='font-bold w-30'>NGO Name</label>
                            </div>
                            <input
                                type="text"
                                id="name"
                                name="0" // Store in the first index of the NGO array
                                placeholder="NGO Name"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Address */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="address" className='font-bold w-30'>NGO Address</label>
                            </div>
                            <textarea
                                id="address"
                                name="1" // Store in the second index of the NGO array
                                placeholder="NGO Address"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Reg ID */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="regId" className='font-bold w-30'>NGO Reg ID</label>
                            </div>
                            <input
                                type="text"
                                id="regId"
                                name="2" // Store in the third index of the NGO array
                                placeholder="NGO Reg ID"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Phone No */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="phoneNo" className='font-bold w-30'>NGO Phone No</label>
                            </div>
                            <input
                                type="number"
                                id="phoneNo"
                                name="3" // Store in the fourth index of the NGO array
                                placeholder="NGO Phone No"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Email */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="email" className='font-bold w-30'>NGO Email</label>
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="4" // Store in the fifth index of the NGO array
                                placeholder="NGO Email"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Type */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="type" className='font-bold w-30'>NGO Type</label>
                            </div>
                            <input
                                type="text"
                                id="type"
                                name="5" // Store in the sixth index of the NGO array
                                placeholder="NGO Type"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Unique ID */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="uniqueId" className='font-bold w-30'>NGO Unique ID</label>
                            </div>
                            <input
                                type="text"
                                id="uniqueId"
                                name="6" // Store in the seventh index of the NGO array
                                placeholder="NGO Unique ID"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Image Link */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="image" className='font-bold w-30'>NGO Image Link</label>
                            </div>
                            <input
                                type="text"
                                id="image"
                                name="7" // Store in the eighth index of the NGO array
                                placeholder="NGO Image Link"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Working Sectors */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="sectors" className='font-bold w-30'>NGO Working Sectors</label>
                            </div>
                            <input
                                type="text"
                                id="sectors"
                                name="8" // Store in the ninth index of the NGO array
                                placeholder="NGO Working Sectors"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        {/* NGO Website */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="website" className='font-bold w-30'>NGO Website</label>
                            </div>
                            <input
                                type="text"
                                id="website"
                                name="9" // Store in the tenth index of the NGO array
                                placeholder="NGO Website"
                                className='w-60'
                                onChange={handleNGOChange}
                                required
                            />
                        </div>

                        <button type="submit" className='bg-blue-500 text-white px-4 py-2 rounded'>Submit NGO</button>
                        <button type="reset" className='bg-blue-500 text-white px-4 py-2 rounded ml-4'>Reset</button>
                    </form>
                    {/* Show success message */}
                    {isSubmitted && <p>Data submitted successfully!</p>}
                </div>

                {/* Form 2: Donation Data */}
                <div>
                    <form className='px-3 py-3' onSubmit={handleSubmitDonation}>
                        <h6 className="mt-1 text-sm leading-6 text-gray-600 ">
                            Donation Data. Please provide all the information about the donation.
                        </h6>

                        {/* Donor Name */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="donorName" className='font-bold w-30'>Donor Name</label>
                            </div>
                            <input
                                type="text"
                                id="donorName"
                                name="0" // Store in the first index of the Donation array
                                placeholder="Donor Name"
                                className='w-60'
                                required
                            />
                        </div>

                        {/* Donation Amount */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="donationAmount" className='font-bold w-30'>Donation Amount</label>
                            </div>
                            <input
                                type="text"
                                id="donationAmount"
                                name="1" // Store in the second index of the Donation array
                                placeholder="Donation Amount"
                                className='w-60'
                                required
                            />
                        </div>

                        {/* Donation NGO ID */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="donationNgoId" className='font-bold w-30'>NGO ID</label>
                            </div>
                            <input
                                type="text"
                                id="donationNgoId"
                                name="2" // Store in the third index of the Donation array
                                placeholder="Donation NGO ID"
                                className='w-60'
                                required
                            />
                        </div>

                        {/* Donation Date */}
                        <div className='flex gap-5 py-2'>
                            <div className='w-44'>
                                <label htmlFor="donationDate" className='font-bold w-30'>Donation Date</label>
                            </div>
                            <input
                                type="date"
                                id="donationDate"
                                name="3" // Store in the fourth index of the Donation array
                                className='w-60'
                                required
                            />
                        </div>

                        <button type="submit" className='bg-green-500 text-white px-3 py-2 rounded-md'>Submit Donation</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Body;