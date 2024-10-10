
import '../scss/pages/Books.scss'
import Layout from '../Layouts/Layout';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { SERVER } from '../config/config';
import useUser from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { faCcStripe } from '@fortawesome/free-brands-svg-icons'; 
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material'; // Ensure you have MUI installed
import PDFModal from '../components/PDFModal';

const Books = () =>{
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [searchText, setSearchText] = useState('');
    const [book, setBook] = useState();
    const {user, loading} = useUser()
    const [paymentModal, setPaymentModal] = useState(false); // State for payment modal
    const [ownedBooks, setOwnedBooks] = useState([])
    const [selectedPDF, setSelectedPDF] = useState('');
    const [pdfModalOpen, setPDFModalOpen] = useState(false);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get(`${SERVER}/books/getBooks`);
                if (response.status === 200) {
                    setBooks(response.data.books);
                }
            } catch (e) {
                console.log(e);
            }
        };
        fetchBooks();
    }, []);

    useEffect(() =>{
        const fetchOwnedBooks = async () =>{
            try{
                const response = await axios.get(`${SERVER}/stripe/getOwnedBooks`, {
                    params : {
                        user_id : user.id
                    }
                })

                if (response.status === 200){
                    setOwnedBooks(response.data.books)
                }
            }catch(err){
                console.log(err)
            }
        }
        fetchOwnedBooks()
    }, [user])

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchText.toLowerCase()) ||
        book.description.toLowerCase().includes(searchText.toLowerCase()) ||
        book.price.toString().includes(searchText.toLowerCase())
    );

    const buyBook = () => {
        setPaymentModal(true); // Open the payment modal
    };

    const handlePaymentClose = () => {
        setPaymentModal(false); // Close the modal
    };

    const Paiement = async (book) =>{
        try {
            const response = await axios.post(`${SERVER}/stripe/buyBook`, {
                book: {
                    name: book.title,
                    price: book.price,
                    id: book.id,
                },
                user_id: user.id, 
            });
            const { sessionId } = response.data;

            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                console.error('Error during checkout:', error);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPaymentModal(false); // Close the modal after payment process
        }
    }

    const shareOn = (book) =>{

    }

    const handlePDFClick = (event, pdfSrc) => {
        event.stopPropagation();
        setSelectedPDF(pdfSrc);
        setPDFModalOpen(true);
    };

    if (!user){
        navigate('/SignIn')
    }else{  
        return(
            <Layout>
                <div className="Books">
                    <div className='div-wallpaper'></div>
                    <div className='main-books'>
                        <h1> Développez Votre Potentiel avec Nos <u>e-Books</u> </h1>
                        <label> Rechercher par mot-clé </label>
                        <div className="form-group">
                            <input
                                type="text"
                                onChange={(e) => setSearchText(e.target.value)}
                                className="search-input"
                            />
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                color="black"
                                size="lg"
                                className="search-icon"
                            />
                        </div>
                        <div className="books-container">
                            <div className="filters">
                                <div className="categories">
                                    <h3> Categories </h3>
                                    <hr />
                                    <div className="categories-container">
                                        <div className="category"> Développement personnel </div>
                                        <div className="category"> Bien etre </div>
                                        <div className="category"> Coaching de vie </div>
                                    </div>
                                </div>
                                <div className="orderbys">
                                    <h3> Trier Par </h3>
                                    <hr />
                                    <div className="orderby-container">
                                        <div className="orderby"> Date </div>
                                        <div className="orderby"> Popularité </div>
                                    </div>
                                </div>
                            </div>
                            <div className="books-elements">
                                {filteredBooks.length > 0 ? (
                                    filteredBooks.map((book) => (
                                        <div className="book" key={book.id}>
                                            <div className="image">
                                                <img src={`${SERVER}${book.image}`} alt="book" />
                                                <h1> PRIX : {book.price.toFixed(2)} € </h1>
                                            </div>
                                            <div className="details">
                                                <h2> {book.title} </h2>
                                                <div className='paragraph'>{book.description.split('\n').map((paragraph, index) => (
                                                    <p key={index}>{paragraph}</p>
                                                ))}</div>
                                                <div className='buttons'>
                                                    {!ownedBooks?.some((ownedBook) => ownedBook.id === book.id) && (
                                                        <button onClick={() => buyBook(book)}>Acheter Maintenant</button>
                                                    )}  
                                                    <button onClick={(e) => handlePDFClick(e, `${SERVER}${book.book_preview}`)}> Visualisez un Extrait Gratuit  </button>
                                                    <button onClick={() => shareOn(book)}> Partager </button>
                                                </div>
                                            </div>

                                            <Dialog open={paymentModal} onClose={handlePaymentClose}>
                                                <DialogTitle>Choose Payment Option</DialogTitle>
                                                <DialogContent>
                                                    <Typography>How would you like to proceed with payment?</Typography>
                                                </DialogContent>
                                                <DialogActions style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px' }}>
                                                    <Button color="primary" variant="contained" onClick={() => Paiement(book)}>
                                                        <FontAwesomeIcon icon={faCcStripe} size="2xl" />
                                                    </Button>
                                                    <Button 
                                                        color="primary" 
                                                        variant="contained" 
                                                        onClick={() => {
                                                            const message = `I want to pay via bank transfer for the product: ${book.title}.`;
                                                            window.open(`https://wa.me/+21655160398?text=${encodeURIComponent(message)}`, '_blank');
                                                        }}
                                                    >
                                                        <WhatsAppIcon style={{ fontSize: 28 }} />
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </div>
                                    ))
                                ) : (
                                    <div className="book-not-found">
                                        Il n'ya aucun Livre pour le moment
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <PDFModal
                    open={pdfModalOpen}
                    onClose={() => setPDFModalOpen(false)}
                    pdfSrc={selectedPDF}
                />
            </Layout>
        )
    }
}

export default Books;