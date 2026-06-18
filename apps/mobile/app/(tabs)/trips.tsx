import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { tripsService, type LogTripDto, type TripItem } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { LineBadge } from '../../components/LineBadge'

// ─── Couleurs officielles IDFM ────────────────────────────────────────────────

const IDFM_COLORS: Record<string, string> = {
  '1':'#ffbe00','2':'#0055c8','3':'#6e6e00','3B':'#82c8e6',
  '4':'#a0006e','5':'#ff5a00','6':'#82dc73','7':'#ff82b4',
  '7B':'#82dc73','8':'#d282be','9':'#d2d200','10':'#dc9600',
  '11':'#6e491e','12':'#00643c','13':'#82c8e6','14':'#640082',
  'A':'#eb2132','B':'#5091cb','C':'#ffcc30','D':'#008b5b','E':'#b94e9a',
  'H':'#84653d','J':'#cec73d','K':'#9b9842','L':'#c4a4cc',
  'N':'#00b297','P':'#f58f53','R':'#f49fb3','U':'#b6134c','V':'#9f9825',
  'T1':'#0055c8','T2':'#a0006e','T3a':'#ff5a00','T3b':'#00643c',
  'T4':'#dc9600','T5':'#640082','T6':'#ff0000','T7':'#6e491e',
  'T8':'#6e6e00','T9':'#3c91dc','T10':'#6e6e00','T11':'#ff5a00',
  'T12':'#a50034','T13':'#8d653d','T14':'#00a092',
}
function lineColor(line: string) {
  return IDFM_COLORS[/^M\d/.test(line) ? line.slice(1) : line] ?? '#6B7A99'
}

// ─── Stations réelles IDFM (source: data.iledefrance-mobilites.fr) ────────────

const STATIONS: Record<string, string[]> = {
  // ── Métro (ordre géographique officiel) ──
  'M1': ['La Défense (Grande Arche)','Esplanade de la Défense','Pont de Neuilly','Les Sablons','Porte Maillot','Argentine','Charles de Gaulle - Étoile','George V','Franklin D. Roosevelt','Champs-Élysées - Clemenceau','Concorde','Tuileries','Palais Royal - Musée du Louvre','Louvre - Rivoli','Châtelet','Hôtel de Ville','Saint-Paul (Le Marais)','Bastille','Gare de Lyon','Reuilly - Diderot','Nation','Porte de Vincennes','Saint-Mandé','Bérault','Château de Vincennes'],
  'M2': ['Porte Dauphine','Victor Hugo','Charles de Gaulle - Étoile','Ternes','Courcelles','Monceau','Villiers','Rome','Place de Clichy','Blanche','Pigalle','Anvers','Barbès - Rochechouart','La Chapelle','Stalingrad','Jaurès','Colonel Fabien','Belleville','Couronnes','Ménilmontant','Père Lachaise','Philippe Auguste','Alexandre Dumas','Avron','Nation'],
  'M3': ['Pont de Levallois - Bécon','Anatole France','Louise Michel','Porte de Champerret','Pereire','Wagram','Malesherbes','Villiers','Europe','Saint-Lazare','Havre-Caumartin','Opéra','Quatre Septembre','Bourse','Sentier','Réaumur - Sébastopol','Arts et Métiers','Temple','République','Parmentier','Rue Saint-Maur','Père Lachaise','Gambetta','Porte de Bagnolet','Gallieni'],
  'M4': ['Bagneux - Lucie Aubrac','Barbara','Mairie de Montrouge',"Porte d'Orléans",'Alésia','Mouton-Duvernet','Denfert-Rochereau','Raspail','Vavin','Montparnasse Bienvenue','Saint-Placide','Saint-Sulpice','Saint-Germain-des-Prés','Odéon','Cité','Saint-Michel','Châtelet','Les Halles','Etienne Marcel','Réaumur - Sébastopol','Strasbourg - Saint-Denis',"Château d'Eau",'Gare de l\'Est','Gare du Nord',"Château Rouge",'Barbès - Rochechouart','Marcadet - Poissonniers','Simplon','Porte de Clignancourt'],
  'M5': ["Place d'Italie",'Campo-Formio','Saint-Marcel','Gare d\'Austerlitz','Quai de la Rapée','Bastille','Bréguet-Sabin','Richard-Lenoir','Oberkampf','Jacques Bonsergent','Gare de l\'Est','Gare du Nord','République','Jaurès','Stalingrad','Laumière','Ourcq','Hoche','Porte de Pantin','Église de Pantin','Bobigny-Pantin - Raymond Queneau','Bobigny - Pablo Picasso'],
  'M6': ['Charles de Gaulle - Étoile','Kléber','Boissière','Trocadéro','Passy','Bir-Hakeim','Dupleix','La Motte-Picquet - Grenelle','Cambronne','Sèvres-Lecourbe','Pasteur','Montparnasse Bienvenue','Edgar Quinet','Raspail','Denfert-Rochereau','Saint-Jacques','Glacière','Corvisart',"Place d'Italie",'Nationale','Chevaleret','Quai de la Gare','Bercy','Dugommier','Daumesnil','Bel-Air','Picpus','Nation'],
  'M7': ['Villejuif - Louis Aragon','Villejuif - Paul Vaillant-Couturier','Villejuif - Léo Lagrange','Le Kremlin-Bicêtre','Maison Blanche','Tolbiac',"Place d'Italie",'Les Gobelins','Censier - Daubenton','Place Monge','Jussieu','Pont Marie (Cité des Arts)','Sully - Morland','Pont Neuf','Châtelet','Palais Royal - Musée du Louvre','Pyramides','Opéra','Chaussée d\'Antin - La Fayette','Le Peletier','Cadet','Poissonnière','Gare de l\'Est','Château Landon','Louis Blanc','Stalingrad','Riquet','Crimée','Corentin Cariou',"Porte de la Villette",'Aubervilliers - Pantin - Quatre Chemins',"Fort d'Aubervilliers",'La Courneuve - 8 Mai 1945'],
  'M8': ['Balard','Lourmel','Commerce','Félix Faure','Boucicaut','La Motte-Picquet - Grenelle','École Militaire','La Tour-Maubourg','Invalides','Concorde','Madeleine','Opéra','Richelieu - Drouot','Grands Boulevards','Bonne Nouvelle','Strasbourg - Saint-Denis','République','Filles du Calvaire','Saint-Sébastien - Froissart','Chemin Vert','Bastille','Ledru-Rollin','Faidherbe - Chaligny','Reuilly - Diderot','Daumesnil','Porte Dorée','Montgallet','Michel Bizot','Porte de Charenton','Charenton - Écoles','Liberté','Ecole Vétérinaire de Maisons-Alfort','Maisons-Alfort - Les Juilliottes','Maisons-Alfort - Stade','Créteil - Préfecture',"Créteil - L'Échat",'Créteil - Université','Pointe du Lac'],
  'M9': ['Pont de Sèvres','Billancourt','Marcel Sembat','Porte de Saint-Cloud','Exelmans','Michel-Ange - Molitor','Michel-Ange - Auteuil','Jasmin','Ranelagh','La Muette','Rue de la Pompe','Trocadéro','Iéna','Alma - Marceau','Franklin D. Roosevelt','Saint-Philippe-du-Roule','Miromesnil','Saint-Augustin','Havre-Caumartin','Chaussée d\'Antin - La Fayette','Richelieu - Drouot','Grands Boulevards','Bonne Nouvelle','Strasbourg - Saint-Denis','République','Oberkampf','Saint-Ambroise','Voltaire','Charonne','Rue des Boulets','Buzenval','Nation','Croix de Chavaux','Robespierre','Maraîchers','Porte de Montreuil','Mairie de Montreuil'],
  'M10': ['Boulogne Jean Jaurès','Boulogne Pont de Saint-Cloud','Avenue Émile Zola','Charles Michels','Javel - André Citroën','Mirabeau','Chardon Lagache','Église d\'Auteuil','Michel-Ange - Auteuil','Michel-Ange - Molitor','Porte d\'Auteuil','La Motte-Picquet - Grenelle','Ségur','Duroc','Vaneau','Sèvres - Babylone','Mabillon','Odéon','Cluny - La Sorbonne','Maubert - Mutualité','Cardinal Lemoine','Jussieu','Gare d\'Austerlitz'],
  'M11': ['Châtelet','Hôtel de Ville','Rambuteau','Arts et Métiers','Oberkampf','République','Goncourt','Belleville','Pyrénées','Jourdain','Télégraphe','Place des Fêtes','Pré-Saint-Gervais','Mairie des Lilas','Rosny-Bois-Perrier','Montreuil - Hôpital','Serge Gainsbourg','Coteaux Beauclair','La Dhuys','Romainville - Carnot'],
  'M12': ["Mairie d'Issy",'Corentin Celton','Vaugirard','Convention','Porte de Versailles','Montparnasse Bienvenue','Notre-Dame-des-Champs','Rennes','Falguière','Pasteur','Volontaires','Sèvres - Babylone','Rue du Bac','Solférino','Assemblée Nationale','Concorde','Madeleine','Saint-Lazare','Notre-Dame-de-Lorette','Trinité - d\'Estienne d\'Orves','Saint-Georges','Pigalle','Abbesses','Lamarck - Caulaincourt','Marcadet - Poissonniers','Jules Joffrin','Marx Dormoy','Porte de la Chapelle','Front Populaire','Aimé Césaire',"Mairie d'Aubervilliers"],
  'M13': ['Châtillon - Montrouge','Malakoff - Rue Étienne Dolet','Malakoff - Plateau de Vanves','Porte de Vanves','Plaisance','Pernety','Gaîté','Montparnasse Bienvenue','Duroc','Saint-François-Xavier','Varenne','Invalides','Champs-Élysées - Clemenceau','Miromesnil','Saint-Lazare','Liège','Place de Clichy','La Fourche','Guy Môquet','Porte de Saint-Ouen','Garibaldi','Saint-Denis - Porte de Paris','Mairie de Saint-Ouen','Saint-Denis - Université','Carrefour Pleyel','Basilique de Saint-Denis'],
  'M14': ['Aéroport d\'Orly','L\'Haÿ-les-Roses','Villejuif - Gustave Roussy','Chevilly-Larue (Marché International)','Thiais - Orly (Pont de Rungis)','Hôpital Bicêtre','Maison Blanche','Olympiades','Bibliothèque François Mitterrand','Cour Saint-Emilion','Bercy','Gare de Lyon','Châtelet','Pyramides','Madeleine','Saint-Lazare','Pont Cardinet','Porte de Clichy','Saint-Ouen','Mairie de Saint-Ouen','Saint-Denis - Pleyel'],
  '3B': ['Gambetta','Saint-Fargeau','Pelleport','Porte des Lilas'],
  '7B': ['Jaurès','Louis Blanc','Bolivar','Botzaris','Buttes Chaumont','Danube','Place des Fêtes','Pré-Saint-Gervais'],
  // ── RER ──
  'A': ['Saint-Germain-en-Laye','Le Vésinet - Centre','Le Vésinet - Le Pecq','Chatou - Croissy','Rueil-Malmaison','Cergy le Haut','Cergy Préfecture','Cergy Saint-Christophe','Neuville Université','Conflans Fin d\'Oise','Achères Grand Cormier','Poissy','Achères Ville','Maisons-Laffitte','Sartrouville','Houilles - Carrières-sur-Seine','Nanterre Ville','Nanterre Université','Nanterre Préfecture','La Défense','Charles de Gaulle - Étoile','Auber','Châtelet - Les Halles','Gare de Lyon','Nation','Vincennes','Fontenay-sous-Bois','Val de Fontenay','Champigny','Sucy - Bonneuil','La Varenne - Chennevières','Boissy-Saint-Léger','Nogent-sur-Marne','Neuilly-Plaisance','Noisy - Champs','Noisy-le-Grand - Mont d\'Est','Noisiel','Lognes','Torcy','Bussy-Saint-Georges','Val d\'Europe','Marne-la-Vallée Chessy'],
  'B': ['Saint-Rémy-lès-Chevreuse','Courcelle-sur-Yvette','Bures-sur-Yvette','Orsay Ville','Le Guichet','Lozère','Gif-sur-Yvette','La Hacquinière','Massy - Verrières','Massy - Palaiseau','Palaiseau','Palaiseau - Villebon','Les Baconnets','Antony','La Croix de Berny','Fontenay-aux-Roses','Robinson','Parc de Sceaux','Sceaux','Bagneux','Arcueil - Cachan','Gentilly','Cité Universitaire','Port Royal','Luxembourg','Saint-Michel Notre-Dame','Châtelet - Les Halles','Gare du Nord','La Plaine Stade de France','Stade de France Saint-Denis','Saint-Denis','La Courneuve - Aubervilliers','Le Bourget','Drancy','Le Blanc-Mesnil','Villepinte','Parc des Expositions','Aéroport CDG 1 (Terminal 3) - RER','Aéroport Charles de Gaulle 2 (Terminal 2)'],
  'C': ['Versailles Château Rive Gauche','Porchefontaine','Viroflay Rive Gauche','Chaville - Vélizy','Meudon Val Fleury','Issy','Javel','Champ de Mars Tour Eiffel','Pont du Garigliano - Hôpital Européen G. Pompidou','Pont de l\'Alma','Avenue Henri Martin','Avenue du Président Kennedy Maison de Radio France','Boulainvilliers','Avenue Foch','Porte de Clichy','Neuilly - Porte Maillot','Musée d\'Orsay','Invalides','Saint-Michel Notre-Dame','Gare d\'Austerlitz','Bibliothèque François Mitterrand','Vitry-sur-Seine','Les Ardoines','Ivry-sur-Seine','Choisy-le-Roi','Orly Ville','Pont de Rungis Aéroport d\'Orly','Juvisy','Savigny-sur-Orge','Épinay-sur-Orge','Brétigny','Étampes','Dourdan','Saint-Martin-d\'Étampes','Versailles Chantiers','Saint-Quentin-en-Yvelines','Massy - Verrières','Massy - Palaiseau','Épinay-sur-Seine','Saint-Ouen','Gennevilliers','Saint-Ouen-l\'Aumône','Saint-Gratien','Franconville - le Plessis','Ermont - Eaubonne','Pontoise'],
  'D': ['Orry-la-Ville - Coye','Chantilly - Gouvieux','Creil','Survilliers - Fosses','Louvres','Villiers-le-Bel - Gonesse - Arnouville','Garges - Sarcelles','Saint-Denis','Stade de France Saint-Denis','Gare du Nord','Châtelet - Les Halles','Gare de Lyon','Maisons-Alfort - Alfortville','Villeneuve-Saint-Georges','Juvisy','Grigny Centre','Évry - Courcouronnes','Corbeil-Essonnes','Melun'],
  'E': ['Neuilly - Porte Maillot','La Défense','Nanterre-La-Folie','Haussmann Saint-Lazare','Magenta','Gare de l\'Est','Rosa Parks','Pantin','Noisy-le-Sec'],
  // ── Tramway ──
  'T1': ['Asnières - Gennevilliers Les Courtilles','La Courneuve - Six Routes','Hôtel de ville de la Courneuve','Marché de Saint-Denis','Gare de Saint-Denis','Basilique de Saint-Denis','Cimetière de Saint-Denis','Hôpital Avicenne','Cosmonautes','Danton','Bobigny - Pablo Picasso','Hôtel de Ville de Bobigny','Libération','Gaston Roulaud','Drancy - Avenir','La Ferme','Stade Géo André','Escadrille Normandie-Niemen','Maurice Lachâtre','Hôpital Delafontaine','La Courneuve - 8 Mai 1945','Théâtre Gérard Philipe'],
  'T2': ['La Défense (Grande Arche)','Faubourg de l\'Arche','Les Fauvelles','Puteaux','Parc Pierre Lagravère','Jacques-Henri Lartigue','Jacqueline Auriol','Henri Farman','Suresnes - Longchamp','Belvédère','Brimborion','Meudon-sur-Seine','Musée de Sèvres','Parc de Saint-Cloud','Pont de Bezons','Victor Basch','Issy - Val de Seine','Porte d\'Issy','Les Moulineaux','Les Milons','Les Coteaux','Charlebourg','Suzanne Lenglen','Porte de Versailles'],
  'T3a': ['Pont du Garigliano','Balard','Desnouettes','Porte de Versailles - Parc des Expositions','Porte de Vanves','Didot','Alésia','Jean Moulin','Porte d\'Orléans','Cité Universitaire','Montsouris','Stade Charléty - Porte de Gentilly','Porte de Choisy','Poterne des Peupliers','Avenue de France','Bibliothèque François Mitterrand','Porte d\'Ivry','Baron le Roy','Maryse Bastié','Porte de Vincennes','Porte Dorée','Montempoivre','Porte de Charenton','Georges Brassens','Alexandra David-Néel','Brancion',"Porte d'Italie"],
  'T3b': ['Porte de Vincennes','Porte de Bagnolet','Porte des Lilas','Porte de Pantin - Parc de la Villette','Rosa Parks','Porte de la Villette (Cité des Sciences et de l\'industrie)','Porte d\'Aubervilliers','Canal Saint-Denis','Porte de la Chapelle','Diane Arbus - Porte des Poissonniers','Angélique Compoint - Porte de Montmartre','Porte de Clichy - Tribunal de Paris','Porte de Saint-Ouen','Épinettes - Pouchet','Square Sainte-Odile','Porte de Champerret','Honoré De Balzac','Porte Maillot - Palais des Congrès','Porte Dauphine (Avenue Foch)'],
  'T4': ['Bondy','Allée de la Tour-Rendez-vous','Arboretum','Lycée Henri Sellier','Maurice Audin','Remise à Jorelle','Rougemont Chanteloup','Hôpital de Montfermeil','Clichy - Montfermeil','L\'Abbaye','Romain Rolland','Léon Blum','Aulnay-sous-Bois','République - Marx Dormoy','Les Coquetiers','Les Pavillons-sous-Bois','Gargan','Notre-Dame-des-Anges','Clichy-sous-Bois - Mairie'],
  'T5': ['Garges - Sarcelles','Les Cholettes','Butte Pinson (Parc Régional)','Les Flanades','Petit Pierrefitte','Mairie de Pierrefitte','Roger Semât','Joncherolles','Suzanne Valadon','Alcide d\'Orbigny','Jacques Prévert','Lochères','Paul Valéry','Baudelaire','Marché de Saint-Denis','Guynemer'],
  'T6': ['Châtillon - Montrouge','Centre de Châtillon','Division Leclerc','Vauban','Georges Millandy','Dewoitine','Mail de la Plaine','Pavé Blanc','Louvois','Soleil Levant','L\'Onde (Maison des Arts)','Georges Pompidou','Parc André Malraux','Hôpital Béclère','Robert Wagner','Vélizy 2','Mairie de Vélizy','Inovel Parc Nord','Viroflay - Rive Droite','Viroflay - Rive Gauche'],
  'T7': ['Villejuif - Louis Aragon','Moulin Vert','Domaine Chérioux','Chevilly-Larue','Auguste Perret (Cimetière Parisien)','Lamartine','La Belle Epine','Bretagne','La Fraternelle','Aéroport d\'Orly','Caroline Aigle (Orlyfret)','Hélène Boucher (Orlytech)','Coeur d\'Orly','Robert Schuman (Parc Silic Centre)','Place de la Logistique','Porte de Rungis','Saarinen',"Porte de l'Essonne"],
  'T8': ['Saint-Denis - Porte de Paris','Saint-Denis - Gare','Épinay-sur-Seine - Gare','Épinay - Orgemont','Les Béatus','Delaunay - Belleville','Gilbert Bonnemaison','Blumenthal','Les Mobiles','Lacépède','Jean Vilar','Pablo Neruda','Rose Bertin','Paul Éluard','César','Pierre de Geyter','Villetaneuse - Université'],
  'T9': ['Orly - Gaston Viens','Germaine Tailleferre','Mairie de Vitry-sur-Seine','Trois Communes','Carle - Darthé','Musée MAC VAL','Château Delacroix','Choisy-le-Roi'],
  'T10': ['Cité-Jardin','La Croix de Berny','Antony','Jardin Parisien','LaVallée','Petit-Châtenay','Malabry','Théâtre La Piscine','Les Peintres','Le Hameau','Vallée aux Loups','Noveos','Hôpital Béclère','Parc des Sports'],
  'T11': ['Dugny - La Courneuve','Le Bourget','Épinay-sur-Seine','Villetaneuse - Université','Pierrefitte - Stains','Stains la Cerisaie','Épinay - Villetaneuse'],
  'T12': ['Massy - Palaiseau','Massy Europe','Gravigny Balizy','Longjumeau','Chilly-Mazarin','Champlan','Épinay-sur-Orge','Bois de Saint-Eutrope','Coteaux de l\'Orge','Traité de Rome','Bois Briard','Petit Vaux','Évry - Courcouronnes','Amédée Gordini','Ferme Neuve','Parc du Château'],
  'T13': ['Saint-Cyr','Les Portes de Saint-Cyr','Allée Royale','Bailly','L\'Etang - Les Sablons','Camp des Loges','Fourqueux - Bel Air','Mareil-Marly','Noisy-le-Roi','Saint-Nom-la-Bretèche - Forêt de Marly','Lisière Pereire','Saint-Germain-en-Laye'],
  'T14': ['Esbly','Villiers Montbarbin','Crécy-la-Chapelle','Montry - Condé','Couilly - Saint-Germain - Quincy'],
  // ── Transilien ──
  'H': ['Gare du Nord','Épinay - Villetaneuse','Saint-Denis','Montsoult - Maffliers','Vaucelles','Taverny','Franconville - Le Plessis-Bouchard','Ermont - Eaubonne','Deuil - Montmagny','Groslay','Sarcelles - Saint-Brice','Domont','Bouffémont - Moisselles','Belloy - Saint-Martin','Seugy','Nointel - Mours','Presles - Courcelles','Viarmes','Écouen - Ézan­ville','Luzarches','Enghien-les-Bains','Champ de Courses d\'Enghien','Gros Noyer Saint-Prix','Saint-Leu-la-Forêt','Bessancourt','Frépillon','Méry-sur-Oise','Pontoise','Pierrelaye','Valmondois','Auvers-sur-Oise','Mériel','Épluches','L\'Isle-Adam - Parmain','Champagne-sur-Oise','Boran-sur-Oise','Bruyères-sur-Oise','Précy-sur-Oise','Persan - Beaumont','Creil','Saint-Leu-d\'Esserent','Chantilly - Gouvieux'],
  'J': ['Gare Saint-Lazare','Asnières-sur-Seine','Colombes','La Garenne-Colombes','Bois-Colombes','Argenteuil','Houilles - Carrières-sur-Seine','Sartrouville','Maisons-Laffitte','Pontoise','Cergy Préfecture','Cergy le Haut','Conflans Fin d\'Oise','Conflans-Sainte-Honorine','Mantes-la-Jolie','Les Mureaux','Épône - Mézières','Aubergenville Élisabethville','Mantes Station','Rosny-sur-Seine','Bonnières','Vernon - Giverny'],
  'K': ['Gare du Nord','Aulnay-sous-Bois','Mitry - Claye','Le Plessis-Belleville','Nanteuil-le-Haudouin','Ormoy-Villers','Crépy-en-Valois'],
  'L': ['Gare Saint-Lazare','Pont Cardinet','Clichy - Levallois','Bécon les Bruyères','Courbevoie','La Garenne-Colombes','Puteaux','La Défense','Nanterre Université','Houilles - Carrières-sur-Seine','Sartrouville','Maisons-Laffitte','Conflans Fin d\'Oise','Versailles Rive Droite','Viroflay - Rive Droite','Chaville Rive Droite','Sèvres - Ville-d\'Avray','Garches - Marnes-la-Coquette','Marly-le-Roi','Le Val d\'Or','Saint-Nom-la-Bretèche Forêt de Marly','Cergy le Haut','Cergy Saint-Christophe'],
  'N': ['Gare Montparnasse','Vanves - Malakoff','Clamart','Meudon','Gare de Bellevue','Chaville Rive Gauche','Viroflay Rive Gauche','Versailles Chantiers','Saint-Cyr','La Verrière','Plaisir - Grignon','Plaisir - Les Clayes','Villepreux - Les Clayes','Beynes','Rambouillet','Dreux'],
  'P': ['Gare de l\'Est','Rosa Parks','Pantin','Noisy-le-Sec','Bondy','Gagny','Le Raincy - Villemomble - Montfermeil','Lagny - Thorigny','Vaires - Torcy','Esbly','Meaux','Trilport','Château-Thierry','Coulommiers','Provins'],
  'R': ['Gare de Lyon','Melun','Fontainebleau - Avon','Montereau','Montargis'],
  'U': ['La Défense','Puteaux','Suresnes Mont Valérien','Saint-Cloud','Chaville Rive Droite','Versailles Chantiers','Trappes','La Verrière','Saint-Quentin en Yvelines - Montigny-le-Bretonneux','Saint-Cyr'],
  'V': ['Versailles Chantiers','Jouy-en-Josas','Petit Jouy Les Loges','Igny','Vauboyen','Bièvres','Massy - Palaiseau'],
}

// ─── Type de ligne ────────────────────────────────────────────────────────────

const LINE_TYPE: Record<string, LogTripDto['lineType']> = {
  M1:'metro',M2:'metro',M3:'metro','3B':'metro',M4:'metro',M5:'metro',M6:'metro',
  M7:'metro',M8:'metro',M9:'metro',M10:'metro',M11:'metro',M12:'metro',M13:'metro',M14:'metro',
  '7B':'metro',A:'rer',B:'rer',C:'rer',D:'rer',E:'rer',
  T1:'tram',T2:'tram',T3a:'tram',T3b:'tram',T4:'tram',T5:'tram',T6:'tram',T7:'tram',
  T8:'tram',T9:'tram',T10:'tram',T11:'tram',T12:'tram',T13:'tram',T14:'tram',
  H:'transilien',J:'transilien',K:'transilien',L:'transilien',N:'transilien',
  P:'transilien',R:'transilien',U:'transilien',V:'transilien',
}

// ─── Branches des lignes ────────────────────────────────────────────────────
// Chaque entrée = liste de tabs. buildStations(baseStations) → liste complète pour ce tab.
// baseStations = STATIONS[line] (source IDFM, une des branches + tronc commun).
interface BranchTab { label: string; buildStations: (base: string[]) => string[] }

// Tronc commun M7 (de Place d'Italie jusqu'à La Courneuve — partagé par les deux branches sud)
const M7_TRUNK = ["Place d'Italie",'Les Gobelins','Censier - Daubenton','Place Monge','Jussieu','Pont Marie (Cité des Arts)','Sully - Morland','Pont Neuf','Châtelet','Palais Royal - Musée du Louvre','Pyramides','Opéra','Chaussée d\'Antin - La Fayette','Le Peletier','Cadet','Poissonnière','Gare de l\'Est','Château Landon','Louis Blanc','Stalingrad','Riquet','Crimée','Corentin Cariou',"Porte de la Villette",'Aubervilliers - Pantin - Quatre Chemins',"Fort d'Aubervilliers",'La Courneuve - 8 Mai 1945']

// Tronc commun M13 (de Châtillon jusqu'à la bifurcation La Fourche)
const M13_TRUNK = ['Châtillon - Montrouge','Malakoff - Rue Étienne Dolet','Malakoff - Plateau de Vanves','Porte de Vanves','Plaisance','Pernety','Gaîté','Montparnasse Bienvenue','Duroc','Saint-François-Xavier','Varenne','Invalides','Champs-Élysées - Clemenceau','Miromesnil','Saint-Lazare','Liège','Place de Clichy','La Fourche']

// Tronc commun RER A (bifurcations ouest à Nanterre, est à Nation/Val de Fontenay)
const A_TRUNK = ['Maisons-Laffitte','Sartrouville','Houilles - Carrières-sur-Seine','Nanterre Ville','Nanterre Université','Nanterre Préfecture','La Défense','Charles de Gaulle - Étoile','Auber','Châtelet - Les Halles','Gare de Lyon','Nation','Vincennes','Fontenay-sous-Bois','Val de Fontenay']

const LINE_BRANCHES: Record<string, BranchTab[]> = {
  // RER A — 5 branches (3 à l'ouest + 2 à l'est)
  'A': [
    { label: 'Saint-Germain-en-Laye', buildStations: _ => ['Saint-Germain-en-Laye','Le Vésinet - Centre','Le Vésinet - Le Pecq','Chatou - Croissy','Rueil-Malmaison',...A_TRUNK] },
    { label: 'Cergy-le-Haut',         buildStations: _ => ['Cergy le Haut','Cergy Préfecture','Cergy Saint-Christophe','Neuville Université','Conflans Fin d\'Oise','Achères Grand Cormier',...A_TRUNK] },
    { label: 'Poissy',                buildStations: _ => ['Poissy','Achères Ville',...A_TRUNK] },
    { label: 'Marne-la-Vallée',       buildStations: _ => [...A_TRUNK,'Nogent-sur-Marne','Neuilly-Plaisance','Noisy - Champs','Noisy-le-Grand - Mont d\'Est','Noisiel','Lognes','Torcy','Bussy-Saint-Georges','Val d\'Europe','Marne-la-Vallée Chessy'] },
    { label: 'Boissy-Saint-Léger',    buildStations: _ => [...A_TRUNK,'Champigny','Sucy - Bonneuil','La Varenne - Chennevières','Boissy-Saint-Léger'] },
  ],
  // M7 — deux branches égales au sud, tronc commun au nord (bifurcation à Place d'Italie)
  'M7': [
    { label: 'vers Villejuif', buildStations: _ => ['Villejuif - Louis Aragon','Villejuif - Paul Vaillant-Couturier','Villejuif - Léo Lagrange','Le Kremlin-Bicêtre','Maison Blanche','Tolbiac',...M7_TRUNK] },
    { label: "vers Mairie d'Ivry", buildStations: _ => ["Mairie d'Ivry",'Pierre et Marie Curie',"Porte d'Ivry",'Porte de Choisy',"Porte d'Italie",'Maison Blanche','Tolbiac',...M7_TRUNK] },
  ],
  // M13 — deux branches égales au nord, tronc commun au sud (bifurcation à La Fourche)
  'M13': [
    { label: 'vers Saint-Denis', buildStations: _ => [...M13_TRUNK,'Guy Môquet','Porte de Saint-Ouen','Garibaldi','Saint-Denis - Porte de Paris','Mairie de Saint-Ouen','Saint-Denis - Université','Carrefour Pleyel','Basilique de Saint-Denis'] },
    { label: 'vers Asnières', buildStations: _ => [...M13_TRUNK,'Brochant','Porte de Clichy','Mairie de Clichy','Gabriel Péri','Les Agnettes','Asnières - Gennevilliers - Les Courtilles'] },
  ],
  // RER B — branche nord Mitry-Claye vs CDG
  'B': [
    { label: 'CDG / Robinson', buildStations: s => s },
    { label: 'Mitry-Claye', buildStations: s => {
      const i = s.indexOf('Gare du Nord'); return i < 0 ? s : [...s.slice(0, i+1),'Aulnay-sous-Bois','Sevran - Beaudottes','Sevran - Livry','Vert-Galant','Villeparisis - Mitry-le-Neuf','Mitry - Claye']
    }},
  ],
  // RER E — branche est Chelles-Gournay vs Tournan (bifurcation à Noisy-le-Sec)
  'E': [
    { label: 'vers Chelles-Gournay', buildStations: s => [...s,'Rosny Bois Perrier','Rosny-sous-Bois','Val de Fontenay','Villiers-sur-Marne - Le Plessis-Trévise','Le Chénay Gagny','Gagny','Chelles - Gournay'] },
    { label: 'vers Tournan', buildStations: s => [...s,'Bondy','Les Yvris Noisy-le-Grand','Vaires - Torcy','Émerainville - Pontault-Combault','Roissy-en-Brie','Ozoir-la-Ferrière','Gretz-Armainvilliers','Tournan'] },
  ],
  // RER D — branche sud Melun vs Corbeil
  'D': [
    { label: 'vers Melun', buildStations: s => s },
    { label: 'vers Corbeil', buildStations: s => {
      const i = s.indexOf('Villeneuve-Saint-Georges'); return i < 0 ? s : [...s.slice(0, i+1),'Vigneux-sur-Seine','Ris-Orangis','Évry - Courcouronnes','Corbeil-Essonnes']
    }},
  ],
}

// ─── Réseau ───────────────────────────────────────────────────────────────────

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const NETWORK: { mode: string; icon: IoniconName; lineType: LogTripDto['lineType']; lines: string[] }[] = [
  { mode: 'Métro',     icon: 'train-outline',      lineType: 'metro',      lines: ['M1','M2','M3','3B','M4','M5','M6','M7','7B','M8','M9','M10','M11','M12','M13','M14'] },
  { mode: 'RER',       icon: 'git-branch-outline',  lineType: 'rer',        lines: ['A','B','C','D','E'] },
  { mode: 'Tram',      icon: 'swap-horizontal-outline', lineType: 'tram',   lines: ['T1','T2','T3a','T3b','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14'] },
  { mode: 'Transilien',icon: 'business-outline',    lineType: 'transilien', lines: ['H','J','K','L','N','P','R','U','V'] },
]

// ─── Calcul d'itinéraire ──────────────────────────────────────────────────────

// Nœuds de correspondance physique (même gare, noms parfois différents par ligne)
const HUBS: Record<string, string>[] = [
  // Châtelet / Les Halles
  { M1:'Châtelet', M4:'Châtelet', M7:'Châtelet', M11:'Châtelet', M14:'Châtelet', A:'Châtelet - Les Halles', B:'Châtelet - Les Halles', D:'Châtelet - Les Halles' },
  // Nation
  { M1:'Nation', M2:'Nation', M6:'Nation', M9:'Nation', A:'Nation' },
  // Gare de Lyon
  { M1:'Gare de Lyon', M14:'Gare de Lyon', A:'Gare de Lyon', D:'Gare de Lyon', R:'Gare de Lyon', P:'Gare de Lyon' },
  // Charles de Gaulle – Étoile
  { M1:'Charles de Gaulle - Étoile', M2:'Charles de Gaulle - Étoile', M6:'Charles de Gaulle - Étoile', A:'Charles de Gaulle - Étoile' },
  // Saint-Lazare
  { M3:'Saint-Lazare', M12:'Saint-Lazare', M13:'Saint-Lazare', M14:'Saint-Lazare', J:'Gare Saint-Lazare', L:'Gare Saint-Lazare', E:'Haussmann Saint-Lazare' },
  // Gare du Nord
  { M4:'Gare du Nord', M5:'Gare du Nord', B:'Gare du Nord', D:'Gare du Nord', E:'Magenta', H:'Gare du Nord', K:'Gare du Nord' },
  // Gare de l'Est
  { M4:'Gare de l\'Est', M5:'Gare de l\'Est', M7:'Gare de l\'Est', P:'Gare de l\'Est' },
  // Montparnasse
  { M4:'Montparnasse Bienvenue', M6:'Montparnasse Bienvenue', M12:'Montparnasse Bienvenue', M13:'Montparnasse Bienvenue', N:'Gare Montparnasse', C:'Versailles Chantiers' },
  // Opéra
  { M3:'Opéra', M7:'Opéra', M8:'Opéra' },
  // République
  { M3:'République', M5:'République', M8:'République', M9:'République', M11:'République' },
  // Bastille
  { M1:'Bastille', M5:'Bastille', M8:'Bastille' },
  // Denfert-Rochereau
  { M4:'Denfert-Rochereau', M6:'Denfert-Rochereau', B:'Denfert-Rochereau' },
  // Invalides
  { M8:'Invalides', M13:'Invalides', C:'Invalides' },
  // La Défense
  { M1:'La Défense (Grande Arche)', A:'La Défense', L:'La Défense', U:'La Défense' },
  // Place d'Italie
  { M5:'Place d\'Italie', M6:'Place d\'Italie', M7:'Place d\'Italie' },
  // Franklin D. Roosevelt  ← M1 + M9
  { M1:'Franklin D. Roosevelt', M9:'Franklin D. Roosevelt' },
  // Trocadéro  ← M6 + M9
  { M6:'Trocadéro', M9:'Trocadéro' },
  // Villiers  ← M2 + M3
  { M2:'Villiers', M3:'Villiers' },
  // Barbès – Rochechouart
  { M2:'Barbès - Rochechouart', M4:'Barbès - Rochechouart' },
  // Strasbourg – Saint-Denis
  { M4:'Strasbourg - Saint-Denis', M8:'Strasbourg - Saint-Denis', M9:'Strasbourg - Saint-Denis' },
  // Jaurès
  { M2:'Jaurès', M5:'Jaurès', '7B':'Jaurès' },
  // Concorde  ← M1 + M8 + M12
  { M1:'Concorde', M8:'Concorde', M12:'Concorde' },
  // Madeleine  ← M8 + M12 + M14
  { M8:'Madeleine', M12:'Madeleine', M14:'Madeleine' },
  // Havre-Caumartin  ← M3 + M9
  { M3:'Havre-Caumartin', M9:'Havre-Caumartin' },
  // Miromesnil  ← M9 + M13
  { M9:'Miromesnil', M13:'Miromesnil' },
  // Oberkampf  ← M5 + M9
  { M5:'Oberkampf', M9:'Oberkampf' },
  // Père Lachaise  ← M2 + M3
  { M2:'Père Lachaise', M3:'Père Lachaise' },
  // Gambetta
  { M3:'Gambetta', '3B':'Gambetta' },
  // Massy-Palaiseau
  { B:'Massy - Palaiseau', T12:'Massy - Palaiseau', V:'Massy - Palaiseau', C:'Massy - Verrières' },
  // Versailles Chantiers
  { N:'Versailles Chantiers', C:'Versailles Château Rive Gauche', U:'Versailles Chantiers' },
  // Bercy ← M6 + M14
  { M6:'Bercy', M14:'Bercy' },
  // Place de Clichy ← M2 + M12 + M13
  { M2:'Place de Clichy', M12:'Place de Clichy', M13:'Place de Clichy' },
  // Sèvres - Babylone ← M9 + M12
  { M9:'Sèvres - Babylone', M12:'Sèvres - Babylone' },
  // Grands Boulevards ← M8 + M9
  { M8:'Grands Boulevards', M9:'Grands Boulevards' },
  // Richelieu - Drouot ← M8 + M9
  { M8:'Richelieu - Drouot', M9:'Richelieu - Drouot' },
  // La Motte-Picquet - Grenelle ← M6 + M8 + M10
  { M6:'La Motte-Picquet - Grenelle', M8:'La Motte-Picquet - Grenelle', M10:'La Motte-Picquet - Grenelle' },
  // Réaumur - Sébastopol ← M3 + M4
  { M3:'Réaumur - Sébastopol', M4:'Réaumur - Sébastopol' },
  // Gare d'Austerlitz ← M5 + M10 + RER C
  { M5:"Gare d'Austerlitz", M10:"Gare d'Austerlitz", C:"Gare d'Austerlitz" },
  // Châtelet (M3B) ← M11
  { M11:'Châtelet', '3B':'Porte des Lilas', _walk: 'true' } as Record<string, string>,
  // Jussieu ← M7 + M10
  { M7:'Jussieu', M10:'Jussieu' },
  // Duroc ← M10 + M13
  { M10:'Duroc', M13:'Duroc' },
  // Vaneau ← M10 + M12 (stations proches, correspondance à pied ~300m)
  // Voltaire ← M9 (pas de correspondance directe)
  // Pigalle ← M2 + M12
  { M2:'Pigalle', M12:'Pigalle' },
  // Abbesses (M12) ↔ Pigalle (M2) — différents niveaux, même quartier
  // Saint-Michel ← M4 + RER B + RER C
  { M4:'Saint-Michel', B:'Saint-Michel Notre-Dame', C:'Saint-Michel Notre-Dame' },
  // Daumesnil ← M6 + M8
  { M6:'Daumesnil', M8:'Daumesnil' },
  // Saint-Lazare → Saint-Augustin (M9) : ~450m à pied
  // M14, M3, M12, M13 passent à Saint-Lazare ; M9 la plus proche est Saint-Augustin
  { M14:'Saint-Lazare', M3:'Saint-Lazare', M12:'Saint-Lazare', M13:'Saint-Lazare', M9:'Saint-Augustin', _walk: 'true' } as Record<string, string>,
  // Havre-Caumartin ← M3 + M9 + RER E (Haussmann Saint-Lazare côté M3)
  // Nom M3 = "Havre-Caumartin", M9 = "Havre-Caumartin" (même station)
  // Gare du Nord : M5 côté "Gare du Nord", RER E côté "Magenta" (bâtiments contigus)
  { M5:'Gare du Nord', E:'Magenta', _walk: 'true' } as Record<string, string>,
  // Châtelet ← M1 + RER (noms différents, même zone)
  { M1:'Châtelet', A:'Châtelet - Les Halles', B:'Châtelet - Les Halles', D:'Châtelet - Les Halles', _label: 'Châtelet – Les Halles' } as Record<string, string>,
  // Montparnasse : M6 appelle ça "Montparnasse Bienvenue", Transilien N "Gare Montparnasse"
  { M6:'Montparnasse Bienvenue', M12:'Montparnasse Bienvenue', N:'Gare Montparnasse', _label: 'Montparnasse' } as Record<string, string>,
]

// Hubs à exclure des doublons (certains hubs remplacent des versions dans la liste principale)
// → on filtre les clés système (_walk, _label) pour le graph

// ─── Meilleur wagon ───────────────────────────────────────────────────────────
// Heuristique : position de la station de correspondance sur la ligne
// → début de ligne = 1er wagon, fin = dernier, milieu = central

function bestWagon(line: string, from: string, transferStation: string): 'avant' | 'milieu' | 'arrière' {
  const s = STATIONS[line] ?? []
  const fi = s.indexOf(from)
  const ti = s.indexOf(transferStation)
  if (fi < 0 || ti < 0 || s.length < 2) return 'milieu'
  const ratio = ti / (s.length - 1)
  const goingForward = ti >= fi
  if (ratio < 0.33) return goingForward ? 'avant' : 'arrière'
  if (ratio > 0.66) return goingForward ? 'arrière' : 'avant'
  return 'milieu'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRouteStations(line: string, from: string, to: string): string[] {
  const base = STATIONS[line] ?? []
  const branches = LINE_BRANCHES[line]
  if (!branches) return base
  for (const branch of branches) {
    const s = branch.buildStations(base)
    if (s.indexOf(from) >= 0 && s.indexOf(to) >= 0) return s
  }
  const seen = new Set<string>()
  const all: string[] = []
  for (const branch of branches) {
    for (const st of branch.buildStations(base)) {
      if (!seen.has(st)) { seen.add(st); all.push(st) }
    }
  }
  return all
}

function stopsBetween(line: string, from: string, to: string): number {
  const s = getRouteStations(line, from, to)
  const fi = s.indexOf(from), ti = s.indexOf(to)
  return fi >= 0 && ti >= 0 ? Math.abs(ti - fi) : 5
}

function intermediateStops(line: string, from: string, to: string): string[] {
  const s = getRouteStations(line, from, to)
  const fi = s.indexOf(from), ti = s.indexOf(to)
  if (fi < 0 || ti < 0 || fi === ti) return []
  const [lo, hi] = fi < ti ? [fi, ti] : [ti, fi]
  const mid = s.slice(lo + 1, hi)
  return fi < ti ? mid : [...mid].reverse()
}

interface ItineraryLeg { line: string; from: string; to: string; stops: number; intermediate: string[] }
interface Transfer { fromStation: string; toStation: string; isWalk: boolean; label?: string }
interface Itinerary { legs: ItineraryLeg[]; transfers: Transfer[]; duration: number }

// Construit un graphe d'adjacence ligne→ligne via les hubs (ignore les clés système _xxx)
function buildGraph(): Map<string, { line: string; stationFrom: string; stationTo: string; isWalk: boolean; label?: string }[]> {
  const g = new Map<string, { line: string; stationFrom: string; stationTo: string; isWalk: boolean; label?: string }[]>()
  for (const hub of HUBS) {
    const isWalk = hub['_walk'] === 'true'
    const label = hub['_label']
    const lines = Object.keys(hub).filter(k => !k.startsWith('_'))
    for (const la of lines) {
      for (const lb of lines) {
        if (la === lb) continue
        if (!g.has(la)) g.set(la, [])
        g.get(la)!.push({ line: lb, stationFrom: hub[la], stationTo: hub[lb], isWalk, label })
      }
    }
  }
  return g
}

const TRANSFER_GRAPH = buildGraph()

function makeLeg(line: string, from: string, to: string): ItineraryLeg {
  const stops = stopsBetween(line, from, to)
  return { line, from, to, stops, intermediate: intermediateStops(line, from, to) }
}

function findItinerary(fromLine: string, fromStation: string, toLine: string, toStation: string): Itinerary {
  // 0 transfer — même ligne
  if (fromLine === toLine) {
    const leg = makeLeg(fromLine, fromStation, toStation)
    return { legs: [leg], transfers: [], duration: Math.max(3, leg.stops * 2) }
  }

  const neighbors = TRANSFER_GRAPH.get(fromLine) ?? []
  let best: Itinerary | null = null

  // Fewer transfers always wins; break ties by total stops
  const score = (it: Itinerary) =>
    it.transfers.length * 500 + it.legs.reduce((a, l) => a + l.stops, 0)

  for (const n1 of neighbors) {
    // 1 correspondance directe fromLine → toLine
    if (n1.line === toLine) {
      const leg1 = makeLeg(fromLine, fromStation, n1.stationFrom)
      const leg2 = makeLeg(toLine, n1.stationTo, toStation)
      const walkPenalty = n1.isWalk ? 5 : 0
      const dur = Math.max(5, leg1.stops * 2 + 4 + walkPenalty + leg2.stops * 2)
      const it: Itinerary = {
        legs: [leg1, leg2],
        transfers: [{ fromStation: n1.stationFrom, toStation: n1.stationTo, isWalk: n1.isWalk, label: n1.label }],
        duration: dur,
      }
      if (!best || score(it) < score(best)) best = it
      continue
    }

    // 2 correspondances fromLine → midLine → toLine
    const midNeighbors = TRANSFER_GRAPH.get(n1.line) ?? []
    for (const n2 of midNeighbors) {
      if (n2.line !== toLine) continue
      const leg1 = makeLeg(fromLine, fromStation, n1.stationFrom)
      const leg2 = makeLeg(n1.line, n1.stationTo, n2.stationFrom)
      const leg3 = makeLeg(toLine, n2.stationTo, toStation)
      const w1 = n1.isWalk ? 5 : 0, w2 = n2.isWalk ? 5 : 0
      const dur = Math.max(8, leg1.stops * 2 + 4 + w1 + leg2.stops * 2 + 4 + w2 + leg3.stops * 2)
      const it: Itinerary = {
        legs: [leg1, leg2, leg3],
        transfers: [
          { fromStation: n1.stationFrom, toStation: n1.stationTo, isWalk: n1.isWalk, label: n1.label },
          { fromStation: n2.stationFrom, toStation: n2.stationTo, isWalk: n2.isWalk, label: n2.label },
        ],
        duration: dur,
      }
      if (!best || score(it) < score(best)) best = it
    }
  }

  // Fallback — aucun itinéraire trouvé en ≤2 correspondances
  // On affiche un trajet direct estimé sur la ligne de départ
  if (!best) {
    best = {
      legs: [{ line: fromLine, from: fromStation, to: toStation, stops: 8, intermediate: [] }],
      transfers: [],
      duration: 40,
    }
  }

  return best
}

// ─── Composants ───────────────────────────────────────────────────────────────

function StationRow({ station, idx, total, c, connections }: { station: string; idx: number; total: number; c: string; connections: string[] }) {
  const isTerminus = idx === 0 || idx === total - 1
  const hasTransfer = connections.length > 0
  return (
    <View style={{ flexDirection:'row' }}>
      <View style={{ width:52, alignItems:'center' }}>
        <View style={{ width:3, flex: idx===0?0:1, backgroundColor:c+'55' }} />
        <View style={{
          width: isTerminus ? 14 : hasTransfer ? 12 : 8,
          height: isTerminus ? 14 : hasTransfer ? 12 : 8,
          borderRadius: isTerminus ? 7 : hasTransfer ? 6 : 4,
          backgroundColor: isTerminus || hasTransfer ? c : '#fff',
          borderWidth: isTerminus || hasTransfer ? 2 : 1.5,
          borderColor: c, zIndex:1,
        }} />
        <View style={{ width:3, flex: idx===total-1?0:1, backgroundColor:c+'55' }} />
      </View>
      <View style={{ flex:1, paddingVertical: isTerminus ? 10 : 6, paddingRight:16, borderBottomWidth: idx < total-1 ? 0.5 : 0, borderBottomColor:'#F1F5F9' }}>
        <Text style={{ fontSize: isTerminus ? 13 : 12, fontWeight: isTerminus || hasTransfer ? '700' : '500', color: isTerminus ? '#1A2340' : hasTransfer ? '#1A2340' : '#374151' }}>
          {station}
        </Text>
        {hasTransfer && (
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4, marginTop:4 }}>
            {connections.map(ol => (
              <LineBadge key={ol} line={ol} size={20} />
            ))}
          </View>
        )}
      </View>
    </View>
  )
}


// ─── Écran principal ──────────────────────────────────────────────────────────

type Step = 'from-line' | 'from-station' | 'to-line' | 'to-station' | 'confirm'

export default function TripsScreen() {
  const { token } = useAuthStore()
  const [week, setWeek] = useState<{ weekTrips: number; weekCo2Saved: number; weekKm: number; streak: number } | null>(null)
  const [step, setStep] = useState<Step>('from-line')
  const [fromLine, setFromLine] = useState<string | null>(null)
  const [fromStation, setFromStation] = useState<string | null>(null)
  const [toLine, setToLine] = useState<string | null>(null)
  const [toStation, setToStation] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [logging, setLogging] = useState(false)
  const [lastLogged, setLastLogged] = useState<string | null>(null)

  const fetchData = () => {
    if (!token) return
    tripsService.getWeek(token).then(setWeek).catch(() => null)
  }
  useEffect(() => { fetchData() }, [token])

  const reset = () => { setStep('from-line'); setFromLine(null); setFromStation(null); setToLine(null); setToStation(null); setSearch('') }

  const openModal = (preselectedLine?: string) => {
    reset()
    if (preselectedLine) { setFromLine(preselectedLine); setStep('from-station') }
    else setStep('from-line')
  }

  const activeStations = useMemo(() => {
    const line = step === 'from-station' ? fromLine : toLine
    if (!line) return []
    const base = STATIONS[line] ?? []
    const branches = LINE_BRANCHES[line]
    let all: string[]
    if (branches) {
      const seen = new Set<string>()
      all = []
      for (const branch of branches) {
        for (const s of branch.buildStations(base)) {
          if (!seen.has(s)) { seen.add(s); all.push(s) }
        }
      }
    } else {
      all = base
    }
    if (!search.trim()) return all
    return all.filter(s => s.toLowerCase().includes(search.toLowerCase()))
  }, [step, fromLine, toLine, search])

  const itinerary = useMemo<Itinerary | null>(() => {
    if (!fromLine || !fromStation || !toLine || !toStation) return null
    return findItinerary(fromLine, fromStation, toLine, toStation)
  }, [fromLine, fromStation, toLine, toStation])

  const modalAccent = step.startsWith('to') && toLine ? lineColor(toLine) : fromLine ? lineColor(fromLine) : '#1A73E8'

  const handleConfirm = async () => {
    if (!token || !fromLine || !fromStation || !toLine || !toStation || !itinerary) return
    setLogging(true)
    const now = new Date().toTimeString().slice(0, 5)
    const arr = new Date(Date.now() + itinerary.duration * 60000).toTimeString().slice(0, 5)
    try {
      await tripsService.log(token, { line: fromLine, toLine: toLine, lineType: LINE_TYPE[fromLine] ?? 'metro', from: fromStation, to: toStation, departureTime: now, arrivalTime: arr, duration: itinerary.duration, zones: [1], itineraryData: itinerary, co2Saved: itinerary.legs.reduce((a, l) => a + l.stops * 150, 0) })
      const kmRate: Record<string, number> = { metro:0.8, rer:1.2, transilien:1.0, bus:0.4, tram:0.5 }
      const earnedPts = 10 + Math.floor(itinerary.duration * (kmRate[LINE_TYPE[fromLine] ?? 'metro'] ?? 0.8)) * 2
      setLastLogged(`${fromLine}→${toLine} · ${fromStation} ➔ ${toStation} · +${earnedPts} pts`)
      setHistory(null) // force reload au prochain switch d'onglet
      reset()
      fetchData()
      reloadHistory()
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible de logger le trajet. Vérifiez votre connexion.')
    } finally { setLogging(false) }
  }

  const [activeTab, setActiveTab] = useState(0)
  const [history, setHistory] = useState<TripItem[] | null>(null)

  useEffect(() => {
    if (activeTab === 1 && token && !history) {
      tripsService.getHistory(token).then(setHistory).catch(() => setHistory([]))
    }
  }, [activeTab, token])

  const [planLine, setPlanLine] = useState<string | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null)

  const { tab: tabParam, tripId: tripIdParam } = useLocalSearchParams<{ tab?: string; tripId?: string }>()
  const handledParams = useRef<string | null>(null)
  useEffect(() => {
    const key = `${tabParam}-${tripIdParam}`
    if (!tabParam || handledParams.current === key) return
    handledParams.current = key
    if (tabParam === '1') {
      setActiveTab(1)
      if (tripIdParam && token) {
        tripsService.getHistory(token).then((h) => {
          setHistory(h)
          const found = h.find((t) => t.id === tripIdParam)
          if (found) setSelectedTrip(found)
        }).catch(() => null)
      }
    }
  }, [tabParam, tripIdParam, token])

  const openPlanLine = (line: string) => { setPlanLine(line) }

  // Recharge l'historique après un nouveau log
  const reloadHistory = () => {
    if (token) tripsService.getHistory(token).then(setHistory).catch(() => null)
  }

  // Pour chaque station d'une ligne, liste les autres lignes qui s'y connectent (via HUBS)
  const lineTransfers = useMemo(() => {
    if (!planLine) return new Map<string, string[]>()
    const result = new Map<string, string[]>()
    for (const hub of HUBS) {
      if (!(planLine in hub)) continue
      const stationName = hub[planLine]
      const others = Object.keys(hub).filter(k => !k.startsWith('_') && k !== planLine)
      if (others.length > 0) result.set(stationName, others)
    }
    return result
  }, [planLine])

  const stepsProgress: { key: Step; label: string }[] = [
    { key: 'from-line', label: 'Départ' }, { key: 'to-line', label: 'Arrivée' }, { key: 'confirm', label: 'Valider' }
  ]
  const stepIdx = step === 'from-line' || step === 'from-station' ? 0 : step === 'to-line' || step === 'to-station' ? 1 : 2

  // Groupe l'historique par date
  const historyByDate = useMemo(() => {
    if (!history) return []
    const groups: { date: string; label: string; trips: TripItem[] }[] = []
    const seen = new Map<string, TripItem[]>()
    for (const t of history) {
      if (!seen.has(t.tripDate)) seen.set(t.tripDate, [])
      seen.get(t.tripDate)!.push(t)
    }
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    for (const [date, trips] of seen) {
      const label = date === today ? "Aujourd'hui" : date === yesterday ? 'Hier' : new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      groups.push({ date, label, trips })
    }
    return groups
  }, [history])

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-6 pt-4 pb-1">
        <Text className="text-xs text-muted font-medium">Réseau Île-de-France</Text>
        <Text className="text-2xl font-black text-fg">Mes trajets</Text>
      </View>

      {/* Stats semaine */}
      {week && (
        <View className="flex-row gap-2 px-6 mt-3">
          {[{v:`${week.weekTrips}`,label:'trajets',color:'#1A73E8'},{v:`${week.weekKm}km`,label:'parcourus',color:'#0D47A1'},{v:`${week.weekCo2Saved}kg`,label:'CO₂ éco.',color:'#2E7D32'},{v:`🔥${week.streak}`,label:'streak',color:'#E65100'}].map(s=>(
            <View key={s.label} className="flex-1 bg-white border border-border rounded-2xl py-2.5 items-center">
              <Text style={{color:s.color}} className="text-sm font-black">{s.v}</Text>
              <Text className="text-[10px] text-muted">{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Onglets */}
      <View className="flex-row bg-surface border-b border-border mt-3">
        {['Trajet', 'Historique', 'Plan'].map((t, i) => (
          <TouchableOpacity key={t} className={`flex-1 py-3 items-center border-b-2 ${activeTab === i ? 'border-primary' : 'border-transparent'}`} onPress={() => setActiveTab(i)}>
            <Text className={`text-xs font-bold ${activeTab === i ? 'text-primary' : 'text-muted'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TAB 0 : Trajet ── */}
      {activeTab === 0 && (
        <View style={{ flex:1 }}>
          <View style={{ flex:1, backgroundColor:'#fff' }}>
              {/* Header */}
              <View style={{ paddingHorizontal:24, paddingTop:18, paddingBottom:12 }}>
                <View style={{ flexDirection:'row', alignItems:'center', marginBottom:14 }}>
                  <View style={{ flex:1 }}>
                    <Text style={{ fontSize:20, fontWeight:'900', color:'#1A2340' }}>
                      {step==='from-line'||step==='from-station' ? 'Départ'
                        : step==='to-line'||step==='to-station' ? 'Arrivée'
                        : 'Itinéraire'}
                    </Text>
                    <Text style={{ fontSize:12, color:'#6B7A99', marginTop:2 }}>
                      {step==='from-line' ? 'Choisissez la ligne de départ'
                        : step==='from-station' ? `Ligne ${fromLine} · quelle station ?`
                        : step==='to-line' ? 'Choisissez la ligne d\'arrivée'
                        : step==='to-station' ? `Ligne ${toLine} · quelle station ?`
                        : 'Vérifiez votre trajet'}
                    </Text>
                  </View>
                  {step !== 'from-line' && (
                    <TouchableOpacity onPress={reset}><Ionicons name="close-outline" size={24} color="#94A3B8" /></TouchableOpacity>
                  )}
                </View>

                {/* Barre de progression */}
                <View style={{ flexDirection:'row', alignItems:'center' }}>
                  {stepsProgress.map((s, i) => {
                    const done = stepIdx > i, active = stepIdx === i
                    return (
                      <View key={s.key} style={{ flexDirection:'row', alignItems:'center', flex: i<2?1:0 }}>
                        <View style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
                          <View style={{ width:26, height:26, borderRadius:13, backgroundColor: done?'#22C55E': active?modalAccent:'#E2E8F0', alignItems:'center', justifyContent:'center' }}>
                            {done
                              ? <Ionicons name="checkmark" size={13} color="#fff" />
                              : <Text style={{ fontSize:11, fontWeight:'800', color: active?'#fff':'#94A3B8' }}>{i+1}</Text>
                            }
                          </View>
                          <Text style={{ fontSize:11, fontWeight: active?'700':'500', color: active?'#1A2340':'#94A3B8' }}>{s.label}</Text>
                        </View>
                        {i<2 && <View style={{ flex:1, height:2, backgroundColor: done?'#22C55E':'#E2E8F0', marginHorizontal:6 }} />}
                      </View>
                    )
                  })}
                </View>

                {/* Bannière succès */}
                {lastLogged && step === 'from-line' && (
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#F0FFF4', borderWidth:1, borderColor:'#86EFAC', borderRadius:12, paddingHorizontal:12, paddingVertical:10, marginBottom:8 }}>
                    <Ionicons name="checkmark-circle" size={18} color="#15803D" />
                    <Text style={{ color:'#15803D', fontSize:12, fontWeight:'600', flex:1 }}>{lastLogged}</Text>
                    <TouchableOpacity onPress={() => setLastLogged(null)}><Ionicons name="close" size={16} color="#86EFAC" /></TouchableOpacity>
                  </View>
                )}

                {/* Recap départ/arrivée */}
                {(fromStation || toStation) && step !== 'confirm' && (
                  <View style={{ flexDirection:'row', gap:6, marginTop:10 }}>
                    {fromLine && fromStation && (
                      <View style={{ flex:1, flexDirection:'row', alignItems:'center', gap:6, backgroundColor:lineColor(fromLine)+'14', borderRadius:10, padding:8 }}>
                        <LineBadge line={fromLine} size={22} />
                        <Text style={{ fontSize:10, fontWeight:'700', color:lineColor(fromLine), flex:1 }} numberOfLines={1}>{fromStation}</Text>
                      </View>
                    )}
                    {toLine && toStation && (
                      <View style={{ flex:1, flexDirection:'row', alignItems:'center', gap:6, backgroundColor:lineColor(toLine)+'14', borderRadius:10, padding:8 }}>
                        <LineBadge line={toLine} size={22} />
                        <Text style={{ fontSize:10, fontWeight:'700', color:lineColor(toLine), flex:1 }} numberOfLines={1}>{toStation}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Choix de ligne */}
              {(step==='from-line' || step==='to-line') && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:32 }}>
                  {NETWORK.map(({ mode, icon, lines }) => (
                    <View key={mode} style={{ marginTop:16 }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:24, marginBottom:10 }}>
                    <Ionicons name={icon} size={14} color="#6B7A99" />
                    <Text style={{ fontSize:12, fontWeight:'700', color:'#6B7A99', textTransform:'uppercase', letterSpacing:0.6 }}>{mode}</Text>
                  </View>
                      {lines.map(line => {
                        const c = lineColor(line)
                        const stations = STATIONS[line] ?? []
                        const terminus1 = stations[0] ?? ''
                        const terminus2 = stations[stations.length - 1] ?? ''
                        return (
                          <TouchableOpacity key={line}
                            onPress={() => { setSearch(''); if (step==='from-line'){setFromLine(line);setStep('from-station')} else {setToLine(line);setStep('to-station')} }}
                            style={{ marginHorizontal:16, marginBottom:8, backgroundColor:'#fff', borderRadius:14, borderWidth:1, borderColor:'#E2E8F0', overflow:'hidden' }}>
                            <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingVertical:10, gap:10 }}>
                              <LineBadge line={line} size={32} />
                              <View style={{ flex:1 }}>
                                <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                                  <View style={{ width:8, height:8, borderRadius:4, backgroundColor:c }} />
                                  <View style={{ flex:1, height:3, backgroundColor:c, borderRadius:2 }} />
                                  <View style={{ width:8, height:8, borderRadius:4, backgroundColor:c }} />
                                </View>
                                <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:4 }}>
                                  <Text style={{ fontSize:9, fontWeight:'700', color:'#374151', maxWidth:'45%' }} numberOfLines={1}>{terminus1}</Text>
                                  <Text style={{ fontSize:9, fontWeight:'700', color:'#374151', maxWidth:'45%', textAlign:'right' }} numberOfLines={1}>{terminus2}</Text>
                                </View>
                              </View>
                              <View style={{ backgroundColor:c+'18', paddingHorizontal:8, paddingVertical:3, borderRadius:8 }}>
                                <Text style={{ fontSize:10, fontWeight:'700', color:c }}>{stations.length} st.</Text>
                              </View>
                              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                            </View>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Choix de station */}
              {(step==='from-station' || step==='to-station') && (
                <>
                  <View style={{ paddingHorizontal:24, paddingBottom:8 }}>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#F1F4FA', borderRadius:14, paddingHorizontal:14, paddingVertical:10 }}>
                      <Ionicons name="search-outline" size={16} color="#94A3B8" />
                      <TextInput value={search} onChangeText={setSearch} placeholder="Rechercher une station…" placeholderTextColor="#94A3B8" style={{ flex:1, fontSize:14, color:'#1A2340' }} autoFocus />
                      {search.length>0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#94A3B8" /></TouchableOpacity>}
                    </View>
                    <TouchableOpacity onPress={() => { setSearch(''); if (step==='from-station') setStep('from-line'); else setStep('to-line') }} style={{ marginTop:8, flexDirection:'row', alignItems:'center', gap:4 }}>
                      <Ionicons name="arrow-back-outline" size={14} color="#6B7A99" />
                      <Text style={{ fontSize:12, color:'#6B7A99' }}>Changer de ligne</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {activeStations.map(station => {
                      const line = step==='from-station' ? fromLine : toLine
                      const c = line ? lineColor(line) : '#1A73E8'
                      return (
                        <TouchableOpacity key={station} onPress={() => { setSearch(''); if (step==='from-station'){setFromStation(station);setStep('to-line')} else {setToStation(station);setStep('confirm')} }}
                          style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:24, paddingVertical:13, borderBottomWidth:1, borderBottomColor:'#F1F4FA' }}>
                          <View style={{ width:8, height:8, borderRadius:4, backgroundColor:c }} />
                          <Text style={{ fontSize:14, color:'#1A2340', flex:1 }}>{station}</Text>
                          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                      )
                    })}
                    <View style={{ height:40 }} />
                  </ScrollView>
                </>
              )}

              {/* Confirmation */}
              {step==='confirm' && itinerary && fromLine && fromStation && toLine && toStation && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ paddingHorizontal:24, paddingBottom:48 }}>
                    <View style={{ flexDirection:'row', gap:8, marginBottom:16 }}>
                      {(() => {
                      const kmRate: Record<string, number> = { metro:0.8, rer:1.2, transilien:1.0, bus:0.4, tram:0.5 }
                      const lt = LINE_TYPE[fromLine] ?? 'metro'
                      const estPts = 10 + Math.floor(itinerary.duration * (kmRate[lt] ?? 0.8)) * 2
                      return [
                        { v: itinerary.transfers.length===0 ? 'Direct' : `${itinerary.transfers.length} corresp.`, label:'Trajet', color: itinerary.transfers.length===0?'#22C55E':'#F59E0B' },
                        { v:`~${itinerary.duration} min`, label:'Durée', color:'#1A73E8' },
                        { v:`+${estPts} pts`, label:'Points', color:'#640082' },
                      ]
                    })().map(s => (
                        <View key={s.label} style={{ flex:1, backgroundColor:'#F8FAFC', borderRadius:14, paddingVertical:12, alignItems:'center', borderWidth:1, borderColor:'#E2E8F0' }}>
                          <Text style={{ fontSize:13, fontWeight:'800', color:s.color }}>{s.v}</Text>
                          <Text style={{ fontSize:9, color:'#94A3B8', marginTop:2 }}>{s.label}</Text>
                        </View>
                      ))}
                    </View>
                    {itinerary.legs.map((leg, i) => {
                      const c = lineColor(leg.line)
                      return (
                        <View key={i}>
                          <View style={{ flexDirection:'row', gap:12 }}>
                            <View style={{ alignItems:'center', width:32 }}>
                              <View style={{ width:32, height:32, borderRadius:9, backgroundColor:c, alignItems:'center', justifyContent:'center', marginTop:2 }}>
                                <Text style={{ color:'#fff', fontWeight:'900', fontSize: (/^M\d/.test(leg.line)?leg.line.slice(1):leg.line).length>2?8:11 }}>
                                  {/^M\d/.test(leg.line)?leg.line.slice(1):leg.line}
                                </Text>
                              </View>
                              <View style={{ width:2, flex:1, backgroundColor:c+'55', marginTop:4 }} />
                            </View>
                            <View style={{ flex:1 }}>
                              <View style={{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:6 }}>
                                <View style={{ width:10, height:10, borderRadius:5, backgroundColor:c, borderWidth:2, borderColor:'#fff' }} />
                                <Text style={{ fontSize:14, fontWeight:'800', color:'#1A2340', flex:1 }}>{leg.from}</Text>
                              </View>
                              {leg.intermediate.map((stop, si) => (
                                <View key={si} style={{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:4 }}>
                                  <View style={{ width:6, height:6, borderRadius:3, backgroundColor:c+'66', marginLeft:2 }} />
                                  <Text style={{ fontSize:12, color:'#6B7A99' }}>{stop}</Text>
                                </View>
                              ))}
                              <View style={{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:6 }}>
                                <View style={{ width:10, height:10, borderRadius:2, backgroundColor:c, borderWidth:2, borderColor:'#fff' }} />
                                <Text style={{ fontSize:14, fontWeight:'800', color:'#1A2340', flex:1 }}>{leg.to}</Text>
                                <View style={{ backgroundColor:c+'20', paddingHorizontal:7, paddingVertical:2, borderRadius:8 }}>
                                  <Text style={{ fontSize:10, fontWeight:'700', color:c }}>{leg.stops} arrêt{leg.stops>1?'s':''}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                          {i < itinerary.legs.length - 1 && (() => {
                            const tr = itinerary.transfers[i]
                            const nextLeg = itinerary.legs[i + 1]
                            const nextColor = lineColor(nextLeg.line)
                            const namesDiffer = tr.fromStation !== tr.toStation
                            const isWalk = tr.isWalk || namesDiffer
                            return (
                              <View style={{ flexDirection:'row', gap:12, marginVertical:4 }}>
                                <View style={{ width:32, alignItems:'center' }}>
                                  <View style={{ width:32, height:32, borderRadius:16, backgroundColor: isWalk?'#FFF3E0':'#F0FFF4', borderWidth:1.5, borderColor: isWalk?'#FFCC80':'#86EFAC', alignItems:'center', justifyContent:'center' }}>
                                    <Ionicons name={isWalk ? 'walk-outline' : 'swap-horizontal-outline'} size={16} color={isWalk ? '#E65100' : '#15803D'} />
                                  </View>
                                </View>
                                <View style={{ flex:1, backgroundColor: isWalk?'#FFF8F0':'#F0FFF4', borderRadius:12, paddingHorizontal:12, paddingVertical:10, borderWidth:1, borderColor: isWalk?'#FFCC80':'#86EFAC' }}>
                                  <Text style={{ fontSize:12, fontWeight:'800', color: isWalk?'#E65100':'#15803D' }}>
                                    {isWalk ? 'Correspondance à pied' : 'Correspondance'}
                                  </Text>
                                  {namesDiffer ? (
                                    <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginTop:4 }}>
                                      <View style={{ backgroundColor:lineColor(leg.line)+'22', paddingHorizontal:6, paddingVertical:2, borderRadius:6 }}>
                                        <Text style={{ fontSize:10, fontWeight:'700', color:lineColor(leg.line) }}>{tr.fromStation}</Text>
                                      </View>
                                      <Text style={{ fontSize:11, color:'#6B7A99' }}>→</Text>
                                      <View style={{ backgroundColor:nextColor+'22', paddingHorizontal:6, paddingVertical:2, borderRadius:6 }}>
                                        <Text style={{ fontSize:10, fontWeight:'700', color:nextColor }}>{tr.toStation}</Text>
                                      </View>
                                    </View>
                                  ) : (
                                    <Text style={{ fontSize:11, color:'#374151', marginTop:2 }}>
                                      {tr.label ?? tr.fromStation} · ligne {nextLeg.line}
                                    </Text>
                                  )}
                                  {(() => {
                                    const wagon = bestWagon(leg.line, leg.from, tr.fromStation)
                                    const positions: ('avant'|'milieu'|'arrière')[] = ['avant','milieu','arrière']
                                    const labels = { avant:'1er wagon', milieu:'Wagon central', arrière:'Dernier wagon' }
                                    const c = lineColor(leg.line)
                                    return (
                                      <View style={{ marginTop:8, flexDirection:'row', alignItems:'center', gap:8 }}>
                                        <View style={{ flexDirection:'row', gap:3 }}>
                                          {positions.map(p => (
                                            <View key={p} style={{ width:22, height:13, borderRadius:3, backgroundColor: wagon===p ? c : '#E2E8F0', borderWidth:1, borderColor: wagon===p ? c : '#CBD5E1', alignItems:'center', justifyContent:'center' }}>
                                              {wagon===p && <View style={{ width:6, height:6, borderRadius:3, backgroundColor:'#fff' }} />}
                                            </View>
                                          ))}
                                        </View>
                                        <Text style={{ fontSize:10, fontWeight:'700', color:c }}>→ {labels[wagon]}</Text>
                                      </View>
                                    )
                                  })()}
                                </View>
                              </View>
                            )
                          })()}
                        </View>
                      )
                    })}
                    <View style={{ flexDirection:'row', gap:8, marginTop:16, padding:14, backgroundColor:'#F8FAFC', borderRadius:16, borderWidth:1, borderColor:'#E2E8F0' }}>
                      <Text style={{ fontSize:12, color:'#6B7A99', flex:1 }}>
                        {itinerary.legs.reduce((a,l)=>a+l.stops,0)} arrêts · {itinerary.transfers.length} corresp.
                      </Text>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                        <Ionicons name="leaf-outline" size={12} color="#22C55E" />
                        <Text style={{ fontSize:12, color:'#22C55E', fontWeight:'700' }}>{(() => { const g = itinerary.legs.reduce((a,l)=>a+l.stops,0)*150; return g>=1000?`${(g/1000).toFixed(1)}kg`:`${g}g` })()} CO₂</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setStep('from-line')} style={{ alignSelf:'center', marginTop:14, marginBottom:12, flexDirection:'row', alignItems:'center', gap:4 }}>
                      <Ionicons name="create-outline" size={14} color="#6B7A99" />
                      <Text style={{ fontSize:13, color:'#6B7A99' }}>Modifier le trajet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirm} disabled={logging}
                      style={{ backgroundColor:'#1A73E8', borderRadius:18, paddingVertical:16, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8 }}>
                      {logging ? <ActivityIndicator color="#fff" /> : <Text style={{ fontSize:16, fontWeight:'900', color:'#fff' }}>Valider ce trajet →</Text>}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
        </View>
      )}

      {/* ── TAB 1 : Historique ── */}
      {activeTab === 1 && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:24, paddingTop:16, paddingBottom:32 }}>
          {history === null ? (
            <ActivityIndicator color="#1A73E8" style={{ marginTop: 32 }} />
          ) : historyByDate.length === 0 ? (
            <View style={{ alignItems:'center', marginTop:48 }}>
              <Ionicons name="train-outline" size={40} color="#CBD5E1" style={{ marginBottom:12 }} />
              <Text style={{ fontSize:15, fontWeight:'700', color:'#1A2340', marginBottom:4 }}>Aucun trajet enregistré</Text>
              <Text style={{ fontSize:13, color:'#6B7A99', textAlign:'center' }}>Enregistrez votre premier trajet dans l'onglet Trajet</Text>
            </View>
          ) : historyByDate.map(({ date, label, trips: dayTrips }) => (
            <View key={date} style={{ marginBottom:20 }}>
              <Text style={{ fontSize:11, fontWeight:'700', color:'#6B7A99', textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>{label}</Text>
              <View style={{ backgroundColor:'#fff', borderRadius:16, borderWidth:1, borderColor:'#E2E8F0', overflow:'hidden' }}>
                {dayTrips.map((trip, i) => {
                  const c = lineColor(trip.line)
                  return (
                    <TouchableOpacity key={trip.id} onPress={() => setSelectedTrip(trip)}
                      style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingVertical:12, gap:12, borderTopWidth: i>0?1:0, borderTopColor:'#F1F5F9' }}>
                      <LineBadge line={trip.line} size={38} />
                      <View style={{ flex:1 }}>
                        <Text style={{ fontSize:13, fontWeight:'700', color:'#1A2340' }} numberOfLines={1}>{trip.from}</Text>
                        <Text style={{ fontSize:11, color:'#6B7A99' }}>→ {trip.to}</Text>
                      </View>
                      <View style={{ alignItems:'flex-end', gap:3 }}>
                        <Text style={{ fontSize:11, fontWeight:'600', color:'#374151' }}>{trip.departureTime}</Text>
                        <View style={{ backgroundColor:c+'22', paddingHorizontal:7, paddingVertical:2, borderRadius:6 }}>
                          <Text style={{ fontSize:10, fontWeight:'700', color:c }}>{trip.duration} min</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize:16, color:'#CBD5E1' }}>›</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── TAB 2 : Plan ── */}
      {activeTab === 2 && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:32 }}>
          {NETWORK.map(({ mode, icon, lines }) => (
            <View key={mode} style={{ marginTop:20 }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:24, marginBottom:10 }}>
                <Ionicons name={icon} size={14} color="#6B7A99" />
                <Text style={{ fontSize:12, fontWeight:'700', color:'#6B7A99', textTransform:'uppercase', letterSpacing:0.6 }}>{mode}</Text>
              </View>
              {lines.map(line => {
                const c = lineColor(line)
                const stations = STATIONS[line] ?? []
                const terminus1 = stations[0] ?? ''
                const terminus2 = stations[stations.length - 1] ?? ''
                return (
                  <TouchableOpacity key={line} onPress={() => openPlanLine(line)}
                    style={{ marginHorizontal:16, marginBottom:8, backgroundColor:'#fff', borderRadius:14, borderWidth:1, borderColor:'#E2E8F0', overflow:'hidden' }}>
                    <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingVertical:10, gap:10 }}>
                      <LineBadge line={line} size={32} />
                      <View style={{ flex:1 }}>
                        <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                          <View style={{ width:8, height:8, borderRadius:4, backgroundColor:c }} />
                          <View style={{ flex:1, height:3, backgroundColor:c, borderRadius:2 }} />
                          <View style={{ width:8, height:8, borderRadius:4, backgroundColor:c }} />
                        </View>
                        <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:4 }}>
                          <Text style={{ fontSize:9, fontWeight:'700', color:'#374151', maxWidth:'45%' }} numberOfLines={1}>{terminus1}</Text>
                          <Text style={{ fontSize:9, fontWeight:'700', color:'#374151', maxWidth:'45%', textAlign:'right' }} numberOfLines={1}>{terminus2}</Text>
                        </View>
                      </View>
                      <View style={{ backgroundColor:c+'18', paddingHorizontal:8, paddingVertical:3, borderRadius:8 }}>
                        <Text style={{ fontSize:10, fontWeight:'700', color:c }}>{stations.length} st.</Text>
                      </View>
                      <Text style={{ fontSize:16, color:'#CBD5E1' }}>›</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── MODAL DÉTAIL TRAJET ─────────────────────────────────────────────── */}
      <Modal visible={selectedTrip !== null} transparent animationType="slide" onRequestClose={() => setSelectedTrip(null)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:'#fff', borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:'80%' }}>
            {selectedTrip && (() => {
              const trip = selectedTrip
              const c = lineColor(trip.line)
              const itData = trip.itineraryData ?? findItinerary(trip.line, trip.from, trip.toLine ?? trip.line, trip.to)
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Handle + Header coloré */}
                  <View style={{ backgroundColor:c, borderTopLeftRadius:28, borderTopRightRadius:28, paddingTop:14, paddingBottom:18, paddingHorizontal:24 }}>
                    <View style={{ width:40, height:4, backgroundColor:'rgba(255,255,255,0.4)', borderRadius:4, alignSelf:'center', marginBottom:16 }} />
                    <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                      <LineBadge line={trip.line} size={44} />
                      <View style={{ flex:1 }}>
                        <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:11, fontWeight:'600' }}>{new Date(trip.tripDate).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}</Text>
                        <Text style={{ color:'#fff', fontSize:16, fontWeight:'900', marginTop:1 }} numberOfLines={1}>{trip.from} → {trip.to}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setSelectedTrip(null)}>
                        <Ionicons name="close-outline" size={24} color="rgba(255,255,255,0.7)" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={{ flexDirection:'row', gap:8, paddingHorizontal:20, paddingTop:16, paddingBottom:8 }}>
                    {[
                      { icon:'time-outline' as IoniconName,      color:'#1A73E8', v:`${trip.departureTime} → ${trip.arrivalTime}`, label:'Horaire' },
                      { icon:'stopwatch-outline' as IoniconName,  color:'#7C3AED', v:`${trip.duration} min`, label:'Durée' },
                      { icon:'leaf-outline' as IoniconName,       color:'#16A34A', v:`${Math.round(trip.co2Saved / 10)}g`, label:'CO₂ éco.' },
                    ].map(s => (
                      <View key={s.label} style={{ flex:1, backgroundColor:'#F8FAFC', borderRadius:12, padding:10, alignItems:'center', borderWidth:1, borderColor:'#E2E8F0' }}>
                        <Ionicons name={s.icon} size={18} color={s.color} />
                        <Text style={{ fontSize:11, fontWeight:'800', color:'#1A2340', marginTop:3 }}>{s.v}</Text>
                        <Text style={{ fontSize:9, color:'#94A3B8' }}>{s.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Itinéraire détaillé */}
                  <View style={{ paddingHorizontal:20, paddingVertical:12 }}>
                    <Text style={{ fontSize:12, fontWeight:'700', color:'#6B7A99', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Détail du trajet</Text>
                    {itData.legs.map((leg, i) => {
                      const lc = lineColor(leg.line)
                      return (
                        <View key={i}>
                          <View style={{ flexDirection:'row', gap:12 }}>
                            <View style={{ alignItems:'center', width:28 }}>
                              <LineBadge line={leg.line} size={28} />
                              {(leg.intermediate.length > 0 || i < itData.legs.length - 1) && (
                                <View style={{ width:2, flex:1, backgroundColor:lc+'44', marginTop:3 }} />
                              )}
                            </View>
                            <View style={{ flex:1, paddingBottom:4 }}>
                              <View style={{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:5 }}>
                                <View style={{ width:9, height:9, borderRadius:4.5, backgroundColor:lc, borderWidth:1.5, borderColor:'#fff' }} />
                                <Text style={{ fontSize:13, fontWeight:'800', color:'#1A2340', flex:1 }}>{leg.from}</Text>
                              </View>
                              {leg.intermediate.map((stop, si) => (
                                <View key={si} style={{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:3 }}>
                                  <View style={{ width:5, height:5, borderRadius:2.5, backgroundColor:lc+'66', marginLeft:2 }} />
                                  <Text style={{ fontSize:11, color:'#8896B0' }}>{stop}</Text>
                                </View>
                              ))}
                              <View style={{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:5 }}>
                                <View style={{ width:9, height:9, borderRadius:2, backgroundColor:lc, borderWidth:1.5, borderColor:'#fff' }} />
                                <Text style={{ fontSize:13, fontWeight:'800', color:'#1A2340', flex:1 }}>{leg.to}</Text>
                                <View style={{ backgroundColor:lc+'20', paddingHorizontal:6, paddingVertical:2, borderRadius:6 }}>
                                  <Text style={{ fontSize:9, fontWeight:'700', color:lc }}>{leg.stops} arrêt{leg.stops>1?'s':''}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                          {i < itData.legs.length - 1 && (() => {
                            const tr = itData.transfers[i]
                            const isWalk = tr.isWalk || tr.fromStation !== tr.toStation
                            return (
                              <View style={{ flexDirection:'row', gap:12, marginVertical:3 }}>
                                <View style={{ width:28, alignItems:'center' }}>
                                  <View style={{ width:28, height:28, borderRadius:14, backgroundColor: isWalk?'#FFF3E0':'#F0FFF4', borderWidth:1, borderColor: isWalk?'#FFCC80':'#86EFAC', alignItems:'center', justifyContent:'center' }}>
                                    <Ionicons name={isWalk ? 'walk-outline' : 'swap-horizontal-outline'} size={14} color={isWalk ? '#E65100' : '#15803D'} />
                                  </View>
                                </View>
                                <View style={{ flex:1, backgroundColor: isWalk?'#FFF8F0':'#F0FFF4', borderRadius:10, paddingHorizontal:10, paddingVertical:7, borderWidth:1, borderColor: isWalk?'#FFCC80':'#86EFAC' }}>
                                  <Text style={{ fontSize:11, fontWeight:'700', color: isWalk?'#E65100':'#15803D' }}>
                                    {isWalk ? `Correspondance à pied · ${tr.fromStation !== tr.toStation ? tr.fromStation + ' → ' + tr.toStation : tr.fromStation}` : `Correspondance · ${tr.fromStation}`}
                                  </Text>
                                  {(() => {
                                    const wagon = bestWagon(leg.line, leg.from, tr.fromStation)
                                    const positions: ('avant'|'milieu'|'arrière')[] = ['avant','milieu','arrière']
                                    const labels = { avant:'1er wagon', milieu:'Wagon central', arrière:'Dernier wagon' }
                                    return (
                                      <View style={{ marginTop:6, flexDirection:'row', alignItems:'center', gap:6 }}>
                                        <View style={{ flexDirection:'row', gap:2 }}>
                                          {positions.map(p => (
                                            <View key={p} style={{ width:18, height:11, borderRadius:2, backgroundColor: wagon===p ? lc : '#E2E8F0', borderWidth:1, borderColor: wagon===p ? lc : '#CBD5E1', alignItems:'center', justifyContent:'center' }}>
                                              {wagon===p && <View style={{ width:5, height:5, borderRadius:2.5, backgroundColor:'#fff' }} />}
                                            </View>
                                          ))}
                                        </View>
                                        <Text style={{ fontSize:10, fontWeight:'700', color:lc }}>{labels[wagon]}</Text>
                                      </View>
                                    )
                                  })()}
                                </View>
                              </View>
                            )
                          })()}
                        </View>
                      )
                    })}
                  </View>

                  {/* Bouton refaire */}
                  <View style={{ paddingHorizontal:20, paddingBottom:32 }}>
                    <TouchableOpacity onPress={() => { setSelectedTrip(null); openModal(trip.line) }}
                      style={{ backgroundColor:c, borderRadius:16, paddingVertical:14, alignItems:'center' }}>
                      <Text style={{ color:'#fff', fontWeight:'900', fontSize:14 }}>Refaire ce trajet →</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )
            })()}
          </View>
        </View>
      </Modal>

      {/* ── MODAL PLAN LIGNE ──────────────────────────────────────────────────── */}
      <Modal visible={planLine !== null} transparent animationType="slide" onRequestClose={() => setPlanLine(null)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:'#fff', borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:'88%' }}>
            {planLine && (() => {
              const line = planLine
              const c = lineColor(line)
              const lineLabel = /^M\d/.test(line) ? line.slice(1) : line
              const base = STATIONS[line] ?? []
              const branches = LINE_BRANCHES[line]

              // Build sections: for branched lines, split into per-branch unique stations + common trunk
              type PlanSection = { label: string | null; stations: string[] }
              let sections: PlanSection[]
              let totalCount: number

              if (branches) {
                const allLists = branches.map(b => b.buildStations(base))
                // trunk = stations present in every branch
                const trunkSet = allLists.reduce((acc, bs) => {
                  const bSet = new Set(bs)
                  return new Set([...acc].filter(s => bSet.has(s)))
                }, new Set(allLists[0] ?? []))
                const branchSections = branches.map((tab, i) => ({
                  label: tab.label,
                  stations: allLists[i].filter(s => !trunkSet.has(s)),
                })).filter(s => s.stations.length > 0)
                const trunk = (allLists[0] ?? []).filter(s => trunkSet.has(s))
                sections = [...branchSections, { label: 'Tronc commun', stations: trunk }]
                totalCount = branchSections.reduce((a, s) => a + s.stations.length, 0) + trunk.length
              } else {
                sections = [{ label: null, stations: base }]
                totalCount = base.length
              }

              return (
                <>
                  {/* Header */}
                  <View style={{ backgroundColor:c, borderTopLeftRadius:28, borderTopRightRadius:28, paddingTop:14, paddingBottom:16, paddingHorizontal:24 }}>
                    <View style={{ width:40, height:4, backgroundColor:'rgba(255,255,255,0.35)', borderRadius:4, alignSelf:'center', marginBottom:14 }} />
                    <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                      <View style={{ width:42, height:42, borderRadius:11, backgroundColor:'rgba(255,255,255,0.22)', alignItems:'center', justifyContent:'center' }}>
                        <Text style={{ color:'#fff', fontWeight:'900', fontSize: lineLabel.length>2?12:18 }}>{lineLabel}</Text>
                      </View>
                      <View style={{ flex:1 }}>
                        <Text style={{ color:'rgba(255,255,255,0.75)', fontSize:11 }}>Toutes les stations</Text>
                        <Text style={{ color:'#fff', fontWeight:'900', fontSize:15 }} numberOfLines={1}>{base[0]} → {base[base.length-1]}</Text>
                      </View>
                      <View style={{ backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:10, paddingVertical:4, borderRadius:10 }}>
                        <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>{totalCount} st.</Text>
                      </View>
                      <TouchableOpacity onPress={() => setPlanLine(null)} style={{ marginLeft:4 }}>
                        <Ionicons name="close-outline" size={24} color="rgba(255,255,255,0.7)" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Liste des stations par sections */}
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical:12 }}>
                    {sections.map((section, si) => (
                      <View key={si}>
                        {section.label && (
                          <View style={{ flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:24, paddingTop: si===0?4:16, paddingBottom:6 }}>
                            <View style={{ flex:1, height:1, backgroundColor:'#E2E8F0' }} />
                            <Text style={{ fontSize:10, fontWeight:'800', color: section.label==='Tronc commun'?'#94A3B8':c, textTransform:'uppercase', letterSpacing:0.8 }}>{section.label}</Text>
                            <View style={{ flex:1, height:1, backgroundColor:'#E2E8F0' }} />
                          </View>
                        )}
                        {section.stations.map((station, idx) => (
                          <StationRow key={`${si}-${idx}`} station={station} idx={idx} total={section.stations.length} c={section.label==='Tronc commun'?'#94A3B8':c} connections={lineTransfers.get(station) ?? []} />
                        ))}
                      </View>
                    ))}
                    <View style={{ height:32 }} />
                  </ScrollView>
                </>
              )
            })()}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}
