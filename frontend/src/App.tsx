import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Library} from './pages/Library';
import {Settings} from './pages/Settings';
import {MediaForm} from './pages/MediaForm';
import {Stats} from './pages/Stats';
import {ArchivedItems} from './pages/ArchivedItems';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Library/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/stats" element={<Stats/>}/>
                <Route path="/media/new/:contentType" element={<MediaForm/>}/>
                <Route path="/media/:id/edit" element={<MediaForm/>}/>
                <Route path="/settings/archived" element={<ArchivedItems />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;