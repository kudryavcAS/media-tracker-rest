import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Library} from './pages/Library';
import {Settings} from './pages/Settings';
import {MediaForm} from './pages/MediaForm';
import {Stats} from './pages/Stats';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Library/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/stats" element={<Stats/>}/>
                <Route path="/media/new/:contentType" element={<MediaForm/>}/>
                <Route path="/media/:id/edit" element={<MediaForm/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;