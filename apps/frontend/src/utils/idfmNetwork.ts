// IDFM network data + pure itinerary computation, ported verbatim from the mobile app
// (apps/mobile/app/(tabs)/trips.tsx). Framework-agnostic, no React/Ionicons dependency.

export type LineType = 'metro' | 'rer' | 'bus' | 'tram' | 'transilien'

// ─── Couleurs officielles IDFM ────────────────────────────────────────────────

export const IDFM_COLORS: Record<string, string> = {
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
export function lineColor(line: string) {
  return IDFM_COLORS[/^M\d/.test(line) ? line.slice(1) : line] ?? '#6B7A99'
}

// ─── Stations réelles IDFM (source: data.iledefrance-mobilites.fr) ────────────

export const STATIONS: Record<string, string[]> = {
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
  'A': ['Saint-Germain-en-Laye','Le Vésinet - Centre','Le Vésinet - Le Pecq','Chatou - Croissy','Rueil-Malmaison','Nanterre Ville','Nanterre Université','Nanterre Préfecture','La Défense','Charles de Gaulle - Étoile','Auber','Châtelet - Les Halles','Gare de Lyon','Nation','Vincennes','Fontenay-sous-Bois','Val de Fontenay','Champigny','Sucy - Bonneuil','Boissy-Saint-Léger','Nogent-sur-Marne','Neuilly-Plaisance','Neuville Université','Cergy Saint-Christophe','Cergy Préfecture','Cergy le Haut','Maisons-Laffitte','Sartrouville','Houilles - Carrières-sur-Seine','Poissy','Achères Ville','Achères Grand Cormier','Conflans Fin d\'Oise','Marne-la-Vallée Chessy','Val d\'Europe','Bussy-Saint-Georges','Lognes','Torcy','Noisiel','Noisy-le-Grand - Mont d\'Est','Noisy - Champs'],
  'B': ['Saint-Rémy-lès-Chevreuse','Courcelle-sur-Yvette','Bures-sur-Yvette','Orsay Ville','Le Guichet','Lozère','Gif-sur-Yvette','La Hacquinière','Massy - Verrières','Massy - Palaiseau','Palaiseau','Palaiseau - Villebon','Les Baconnets','Antony','La Croix de Berny','Fontenay-aux-Roses','Robinson','Parc de Sceaux','Sceaux','Bagneux','Arcueil - Cachan','Gentilly','Cité Universitaire','Port Royal','Luxembourg','Saint-Michel Notre-Dame','Châtelet - Les Halles','Gare du Nord','La Plaine Stade de France','Stade de France Saint-Denis','Saint-Denis','La Courneuve - Aubervilliers','Le Bourget','Drancy','Le Blanc-Mesnil','Sevran - Beaudottes','Villepinte','Parc des Expositions','Sevran - Livry','Vert-Galant','Villeparisis - Mitry-le-Neuf','Mitry - Claye','Aéroport CDG 1 (Terminal 3) - RER','Aéroport Charles de Gaulle 2 (Terminal 2)'],
  'C': ['Versailles Château Rive Gauche','Porchefontaine','Viroflay Rive Gauche','Chaville - Vélizy','Meudon Val Fleury','Issy','Javel','Champ de Mars Tour Eiffel','Pont du Garigliano - Hôpital Européen G. Pompidou','Pont de l\'Alma','Avenue Henri Martin','Avenue du Président Kennedy Maison de Radio France','Boulainvilliers','Avenue Foch','Porte de Clichy','Neuilly - Porte Maillot','Épinay-sur-Seine','Saint-Ouen','Gennevilliers','Saint-Ouen-l\'Aumône','Saint-Gratien','Pontoise','Gare d\'Austerlitz','Bibliothèque François Mitterrand','Vitry-sur-Seine','Les Ardoines','Ivry-sur-Seine','Choisy-le-Roi','Orly Ville','Pont de Rungis Aéroport d\'Orly','Musée d\'Orsay','Invalides','Saint-Michel Notre-Dame','Versailles Chantiers','Massy - Verrières','Massy - Palaiseau','Juvisy','Savigny-sur-Orge','Épinay-sur-Orge','Brétigny','Étampes','Dourdan'],
  'D': ['Orry-la-Ville - Coye','Chantilly - Gouvieux','Creil','Survilliers - Fosses','Louvres','Villiers-le-Bel - Gonesse - Arnouville','Garges - Sarcelles','Saint-Denis','Stade de France Saint-Denis','Gare du Nord','Châtelet - Les Halles','Gare de Lyon','Maisons-Alfort - Alfortville','Villeneuve-Saint-Georges','Juvisy','Grigny Centre','Évry - Courcouronnes','Corbeil-Essonnes','Melun'],
  'E': ['Neuilly - Porte Maillot','La Défense','Nanterre-La-Folie','Haussmann Saint-Lazare','Magenta','Gare de l\'Est','Rosa Parks','Pantin','Noisy-le-Sec','Rosny Bois Perrier','Rosny-sous-Bois','Val de Fontenay','Villiers-sur-Marne - Le Plessis-Trévise','Le Chénay Gagny','Gagny','Chelles - Gournay','Vaires - Torcy','Bondy','Les Yvris Noisy-le-Grand','Émerainville - Pontault-Combault','Roissy-en-Brie','Ozoir-la-Ferrière','Gretz-Armainvilliers','Tournan'],
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

export const LINE_TYPE: Record<string, LineType> = {
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
export interface BranchTab { label: string; buildStations: (base: string[]) => string[] }

// Tronc commun M7 (de Place d'Italie jusqu'à La Courneuve — partagé par les deux branches sud)
const M7_TRUNK = ["Place d'Italie",'Les Gobelins','Censier - Daubenton','Place Monge','Jussieu','Pont Marie (Cité des Arts)','Sully - Morland','Pont Neuf','Châtelet','Palais Royal - Musée du Louvre','Pyramides','Opéra','Chaussée d\'Antin - La Fayette','Le Peletier','Cadet','Poissonnière','Gare de l\'Est','Château Landon','Louis Blanc','Stalingrad','Riquet','Crimée','Corentin Cariou',"Porte de la Villette",'Aubervilliers - Pantin - Quatre Chemins',"Fort d'Aubervilliers",'La Courneuve - 8 Mai 1945']

// Tronc commun M13 (de Châtillon jusqu'à la bifurcation La Fourche)
const M13_TRUNK = ['Châtillon - Montrouge','Malakoff - Rue Étienne Dolet','Malakoff - Plateau de Vanves','Porte de Vanves','Plaisance','Pernety','Gaîté','Montparnasse Bienvenue','Duroc','Saint-François-Xavier','Varenne','Invalides','Champs-Élysées - Clemenceau','Miromesnil','Saint-Lazare','Liège','Place de Clichy','La Fourche']

export const LINE_BRANCHES: Record<string, BranchTab[]> = {
  // M7 — deux branches égales au sud, tronc commun au nord (bifurcation à Place d'Italie)
  'M7': [
    { label: 'vers Villejuif', buildStations: _ => ['Villejuif - Louis Aragon','Villejuif - Paul Vaillant-Couturier','Villejuif - Léo Lagrange','Le Kremlin-Bicêtre','Maison Blanche','Tolbiac',...M7_TRUNK] },
    { label: "vers Mairie d'Ivry", buildStations: _ => ["Mairie d'Ivry",'Pierre et Marie Curie',"Porte d'Ivry",'Porte de Choisy',"Porte d'Italie",...M7_TRUNK] },
  ],
  // M13 — deux branches égales au nord, tronc commun au sud (bifurcation à La Fourche)
  'M13': [
    { label: 'vers Saint-Denis', buildStations: _ => [...M13_TRUNK,'Guy Môquet','Porte de Saint-Ouen','Garibaldi','Saint-Denis - Porte de Paris','Mairie de Saint-Ouen','Saint-Denis - Université','Carrefour Pleyel','Basilique de Saint-Denis'] },
    { label: 'vers Asnières', buildStations: _ => [...M13_TRUNK,'Brochant','Porte de Clichy','Mairie de Clichy','Gabriel Péri','Les Agnettes','Asnières - Gennevilliers - Les Courtilles'] },
  ],
  // RER A — 4 branches (2 à l'est, 2 à l'ouest)
  'A': [
    { label: 'Marne-la-Vallée', buildStations: s => s },
    { label: 'Boissy-Saint-Léger', buildStations: s => {
      const i = s.indexOf('Nation'); return i < 0 ? s : [...s.slice(0, i+1),'Sucy - Bonneuil','La Varenne - Chennevières','Boissy-Saint-Léger']
    }},
    { label: 'Cergy-le-Haut', buildStations: s => {
      const i = s.indexOf('Nanterre - Préfecture'); return i < 0 ? s : [...s.slice(0, i+1),'Nanterre - Ville','Houilles - Carrières-sur-Seine','Sartrouville','Maisons-Laffitte','Achères-Grand Cormier','Conflans-Sainte-Honorine','Neuville-Université','Cergy - Saint-Christophe','Cergy - Préfecture','Cergy-le-Haut']
    }},
    { label: 'Poissy', buildStations: s => {
      const i = s.indexOf('Nanterre - Préfecture'); return i < 0 ? s : [...s.slice(0, i+1),'Nanterre - Ville','Houilles - Carrières-sur-Seine','Sartrouville','Maisons-Laffitte','Achères - Ville','Poissy']
    }},
  ],
  // RER B — branche nord Mitry-Claye vs CDG
  'B': [
    { label: 'CDG / Robinson', buildStations: s => s },
    { label: 'Mitry-Claye', buildStations: s => {
      const i = s.indexOf('Gare du Nord'); return i < 0 ? s : [...s.slice(0, i+1),'Aulnay-sous-Bois','Sevran - Beaudottes','Sevran - Livry','Villeparisis - Mitry-le-Neuf','Mitry - Claye']
    }},
  ],
  // RER D — branche sud Melun vs Corbeil
  'D': [
    { label: 'vers Melun', buildStations: s => s },
    { label: 'vers Corbeil', buildStations: s => {
      const i = s.indexOf('Villeneuve-Saint-Georges'); return i < 0 ? s : [...s.slice(0, i+1),'Vigneux-sur-Seine','Ris-Orangis','Évry-Courcouronnes','Corbeil-Essonnes']
    }},
  ],
}

// ─── Réseau ───────────────────────────────────────────────────────────────────

export const NETWORK: { mode: string; lineType: LineType; lines: string[] }[] = [
  { mode: 'Métro',     lineType: 'metro',      lines: ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14'] },
  { mode: 'RER',       lineType: 'rer',        lines: ['A','B','C','D','E'] },
  { mode: 'Tram',      lineType: 'tram',       lines: ['T1','T2','T3a','T3b','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14'] },
  { mode: 'Transilien',lineType: 'transilien', lines: ['H','J','K','L','N','P','R','U','V'] },
]

// ─── Calcul d'itinéraire ──────────────────────────────────────────────────────

// Nœuds de correspondance physique (même gare, noms parfois différents par ligne)
export const HUBS: Record<string, string>[] = [
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
  // Bercy ← M6 + M14 (noms identiques, même station)
  { M6:'Bercy', M14:'Bercy' },
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

export function bestWagon(line: string, from: string, transferStation: string): 'avant' | 'milieu' | 'arrière' {
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

function stopsBetween(line: string, from: string, to: string): number {
  const s = STATIONS[line] ?? []
  const fi = s.indexOf(from), ti = s.indexOf(to)
  return fi >= 0 && ti >= 0 ? Math.abs(ti - fi) : 5
}

function intermediateStops(line: string, from: string, to: string): string[] {
  const s = STATIONS[line] ?? []
  const fi = s.indexOf(from), ti = s.indexOf(to)
  if (fi < 0 || ti < 0 || fi === ti) return []
  const [lo, hi] = fi < ti ? [fi, ti] : [ti, fi]
  const mid = s.slice(lo + 1, hi)
  return fi < ti ? mid : [...mid].reverse()
}

export interface ItineraryLeg { line: string; from: string; to: string; stops: number; intermediate: string[] }
export interface Transfer { fromStation: string; toStation: string; isWalk: boolean; label?: string }
export interface Itinerary { legs: ItineraryLeg[]; transfers: Transfer[]; duration: number }

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

export function findItinerary(fromLine: string, fromStation: string, toLine: string, toStation: string): Itinerary {
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

  // Fallback
  if (!best) {
    const leg1 = makeLeg(fromLine, fromStation, fromStation)
    const leg2 = makeLeg(toLine, toStation, toStation)
    best = { legs: [leg1, leg2], transfers: [{ fromStation, toStation, isWalk: true }], duration: 40 }
  }

  return best
}
