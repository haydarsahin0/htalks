/* =========================================================
   OYUN 03 · FUTBOL XOX — hazır tablolar
   ---------------------------------------------------------
   Her tablo: 3 satır × 3 sütun kriter ve her kare için
   örnek (doğru) cevaplar. Örnekler sadece tur sonunda ve
   Hasan cevabı onaylarken ipucu olarak gösterilir.
   Kriter tipleri:
     K(kulüp, renk1, renk2)  ·  U(ülke adı, bayrak kodu)  ·  T(metin, ikon)
   ========================================================= */
(function () {
  const K = (t, c1, c2) => ({ k: "club", t, c1, c2 });
  const U = (t, f) => ({ k: "country", t, f });
  const T = (t, i) => ({ k: "text", t, i });

  const GS = K("Galatasaray", "#a90432", "#fdb912");
  const FB = K("Fenerbahçe", "#0b2d72", "#ffed00");
  const BJK = K("Beşiktaş", "#111111", "#ffffff");
  const RM = K("Real Madrid", "#ffffff", "#febe10");
  const FCB = K("Barcelona", "#a50044", "#004d98");
  const FCBay = K("Bayern Münih", "#dc052d", "#ffffff");
  const BVB = K("Dortmund", "#fde100", "#111111");
  const B04 = K("Leverkusen", "#e32221", "#111111");
  const JUV = K("Juventus", "#111111", "#ffffff");
  const INT = K("Inter", "#0068a8", "#111111");
  const ACM = K("Milan", "#fb090b", "#111111");
  const CHE = K("Chelsea", "#034694", "#ffffff");
  const ARS = K("Arsenal", "#ef0107", "#ffffff");
  const LIV = K("Liverpool", "#c8102e", "#00b2a9");
  const MUN = K("Manchester United", "#da291c", "#fbe122");
  const MCI = K("Manchester City", "#6cabdd", "#1c2c5b");
  const PSG = K("PSG", "#004170", "#da291c");

  const BR = U("Brezilya", "br"), FR = U("Fransa", "fr"), NL = U("Hollanda", "nl"), AR = U("Arjantin", "ar");
  const ES = U("İspanya", "es"), PT = U("Portekiz", "pt"), IT = U("İtalya", "it"), TR = U("Türkiye", "tr"), UY = U("Uruguay", "uy");

  window.XOX_GRIDS = [
    {
      id: "sl-ulke1", title: "Süper Lig devleri × Avrupa & Brezilya",
      rows: [GS, FB, BJK], cols: [BR, NL, FR],
      ex: [
        [["Cláudio Taffarel", "Felipe Melo", "Mário Jardel"], ["Wesley Sneijder", "Frank de Boer", "Ryan Babel"], ["Bafétimbi Gomis", "Tanguy Ndombele"]],
        [["Alex de Souza", "Roberto Carlos", "Fred"], ["Robin van Persie", "Dirk Kuyt", "Pierre van Hooijdonk"], ["Nicolas Anelka", "Mathieu Valbuena"]],
        [["Anderson Talisca", "Bobô"], ["Ryan Babel", "Wout Weghorst"], ["Pascal Nouma", "Valentin Rosier"]],
      ],
    },
    {
      id: "sl-ulke2", title: "Süper Lig devleri × Afrika, Portekiz, İspanya",
      rows: [GS, FB, BJK], cols: [T("Afrikalı", "🌍"), PT, ES],
      ex: [
        [["Didier Drogba", "Emmanuel Eboué", "Victor Osimhen"], ["Sérgio Oliveira", "Bruma"], ["Juan Mata", "Albert Riera"]],
        [["Moussa Sow", "Stephen Appiah", "Youssef En-Nesyri"], ["Raul Meireles", "Bruno Alves", "Nani"], ["Dani Güiza"]],
        [["Vincent Aboubakar", "Demba Ba"], ["Ricardo Quaresma", "Pepe", "Simão Sabrosa"], ["Guti", "Álvaro Negredo"]],
      ],
    },
    {
      id: "devler1", title: "İspanya & Almanya devleri × Brezilya, Fransa, Hollanda",
      rows: [RM, FCB, FCBay], cols: [BR, FR, NL],
      ex: [
        [["Ronaldo Nazário", "Roberto Carlos", "Marcelo", "Vinícius Júnior"], ["Zinedine Zidane", "Karim Benzema", "Kylian Mbappé"], ["Clarence Seedorf", "Wesley Sneijder", "Arjen Robben", "Ruud van Nistelrooy"]],
        [["Ronaldinho", "Rivaldo", "Neymar", "Dani Alves"], ["Thierry Henry", "Antoine Griezmann", "Ousmane Dembélé", "Jules Koundé"], ["Johan Cruyff", "Patrick Kluivert", "Frenkie de Jong", "Ronald Koeman"]],
        [["Giovane Élber", "Lúcio", "Dante", "Douglas Costa"], ["Franck Ribéry", "Kingsley Coman", "Bixente Lizarazu", "Michael Olise"], ["Arjen Robben", "Mark van Bommel", "Roy Makaay", "Matthijs de Ligt"]],
      ],
    },
    {
      id: "italya", title: "İtalya devleri × Arjantin, Fransa, Brezilya",
      rows: [JUV, INT, ACM], cols: [AR, FR, BR],
      ex: [
        [["Gonzalo Higuaín", "Carlos Tevez", "Paulo Dybala", "Ángel Di María"], ["Zinedine Zidane", "Michel Platini", "David Trezeguet", "Paul Pogba"], ["Alex Sandro", "Danilo", "Dani Alves"]],
        [["Javier Zanetti", "Lautaro Martínez", "Diego Milito", "Hernán Crespo"], ["Youri Djorkaeff", "Marcus Thuram", "Benjamin Pavard"], ["Ronaldo Nazário", "Adriano", "Júlio César", "Maicon"]],
        [["Hernán Crespo", "Gonzalo Higuaín"], ["Marcel Desailly", "Theo Hernández", "Olivier Giroud", "Mike Maignan"], ["Kaká", "Cafu", "Ronaldinho", "Dida"]],
      ],
    },
    {
      id: "ingiltere1", title: "Londra & Liverpool × Fransa, İspanya, Brezilya",
      rows: [CHE, ARS, LIV], cols: [FR, ES, BR],
      ex: [
        [["Marcel Desailly", "Claude Makélélé", "N'Golo Kanté", "Nicolas Anelka"], ["Fernando Torres", "Juan Mata", "César Azpilicueta", "Cesc Fàbregas"], ["Thiago Silva", "Willian", "Oscar", "Ramires"]],
        [["Thierry Henry", "Patrick Vieira", "Robert Pires", "William Saliba"], ["Cesc Fàbregas", "Mikel Arteta", "David Raya"], ["Gilberto Silva", "Gabriel Magalhães", "Gabriel Jesus", "Gabriel Martinelli"]],
        [["Ibrahima Konaté", "Hugo Ekitiké", "Mamadou Sakho"], ["Xabi Alonso", "Fernando Torres", "Pepe Reina", "Thiago Alcântara"], ["Alisson Becker", "Roberto Firmino", "Fabinho", "Philippe Coutinho"]],
      ],
    },
    {
      id: "ingiltere2", title: "Manchester & Liverpool × Portekiz, Arjantin, Hollanda",
      rows: [MUN, MCI, LIV], cols: [PT, AR, NL],
      ex: [
        [["Cristiano Ronaldo", "Nani", "Bruno Fernandes", "Diogo Dalot"], ["Juan Sebastián Verón", "Carlos Tevez", "Lisandro Martínez", "Alejandro Garnacho"], ["Ruud van Nistelrooy", "Edwin van der Sar", "Jaap Stam", "Robin van Persie"]],
        [["Bernardo Silva", "Rúben Dias", "João Cancelo"], ["Sergio Agüero", "Carlos Tevez", "Pablo Zabaleta", "Julián Álvarez"], ["Nathan Aké", "Nigel de Jong", "Tijjani Reijnders"]],
        [["Diogo Jota"], ["Javier Mascherano", "Alexis Mac Allister", "Maxi Rodríguez"], ["Virgil van Dijk", "Cody Gakpo", "Dirk Kuyt", "Georginio Wijnaldum"]],
      ],
    },
    {
      id: "kupalar", title: "Kupalar × Real Madrid, Barcelona, Milan",
      rows: [T("Dünya Kupası kazandı", "🏆"), T("Şampiyonlar Ligi kazandı", "⭐"), T("Ballon d'Or kazandı", "🥇")], cols: [RM, FCB, ACM],
      ex: [
        [["Zinedine Zidane", "Ronaldo Nazário", "Iker Casillas", "Sergio Ramos"], ["Ronaldinho", "Xavi", "Andrés Iniesta", "Lionel Messi"], ["Cafu", "Andrea Pirlo", "Gennaro Gattuso", "Kaká"]],
        [["Raúl", "Cristiano Ronaldo", "Luka Modrić", "Toni Kroos"], ["Lionel Messi", "Xavi", "Carles Puyol", "Andrés Iniesta"], ["Paolo Maldini", "Kaká", "Andriy Shevchenko", "Clarence Seedorf"]],
        [["Cristiano Ronaldo", "Zinedine Zidane", "Luís Figo", "Luka Modrić", "Karim Benzema"], ["Lionel Messi", "Ronaldinho", "Rivaldo", "Luís Figo"], ["Marco van Basten", "Kaká", "Andriy Shevchenko", "George Weah", "Ruud Gullit"]],
      ],
    },
    {
      id: "milli-kulup", title: "Türkiye, Brezilya, Arjantin × GS, FB, Inter",
      rows: [TR, BR, AR], cols: [GS, FB, INT],
      ex: [
        [["Arda Turan", "Emre Belözoğlu", "Selçuk İnan", "Metin Oktay"], ["Volkan Demirel", "Emre Belözoğlu", "Tuncay Şanlı", "Arda Güler"], ["Emre Belözoğlu", "Hakan Çalhanoğlu", "Okan Buruk"]],
        [["Cláudio Taffarel", "Felipe Melo", "Mário Jardel"], ["Alex de Souza", "Roberto Carlos", "Fred"], ["Ronaldo Nazário", "Adriano", "Júlio César", "Maicon"]],
        [["Mauro Icardi"], ["Ariel Ortega"], ["Javier Zanetti", "Lautaro Martínez", "Diego Milito", "Hernán Crespo"]],
      ],
    },
    {
      id: "mevki", title: "Mevkiler × Galatasaray, Real Madrid, Juventus",
      rows: [T("Kaleci", "🧤"), T("Orta saha", "🎯"), T("Forvet", "⚽")], cols: [GS, RM, JUV],
      ex: [
        [["Fernando Muslera", "Cláudio Taffarel"], ["Iker Casillas", "Thibaut Courtois", "Keylor Navas"], ["Gianluigi Buffon", "Dino Zoff", "Wojciech Szczęsny"]],
        [["Gheorghe Hagi", "Wesley Sneijder", "Emre Belözoğlu", "Selçuk İnan"], ["Zinedine Zidane", "Luka Modrić", "Toni Kroos", "Jude Bellingham"], ["Andrea Pirlo", "Pavel Nedvěd", "Paul Pogba"]],
        [["Mauro Icardi", "Didier Drogba", "Victor Osimhen", "Metin Oktay"], ["Raúl", "Karim Benzema", "Kylian Mbappé", "Alfredo Di Stéfano"], ["Alessandro Del Piero", "Dušan Vlahović", "Gonzalo Higuaín", "David Trezeguet"]],
      ],
    },
    {
      id: "golkrali", title: "Gol kralları × Arjantin, Fransa, Uruguay",
      rows: [T("Premier Lig gol kralı oldu", "👟"), T("La Liga gol kralı oldu", "👟"), T("Serie A gol kralı oldu", "👟")], cols: [AR, FR, UY],
      ex: [
        [["Sergio Agüero", "Carlos Tevez"], ["Thierry Henry", "Nicolas Anelka"], ["Luis Suárez"]],
        [["Lionel Messi"], ["Karim Benzema", "Kylian Mbappé"], ["Diego Forlán", "Luis Suárez"]],
        [["Mauro Icardi", "Gonzalo Higuaín", "Lautaro Martínez", "Gabriel Batistuta"], ["Michel Platini", "David Trezeguet"], ["Edinson Cavani"]],
      ],
    },
    {
      id: "inter-che-psg", title: "Inter, Chelsea, PSG × Brezilya, Arjantin, İtalya",
      rows: [INT, CHE, PSG], cols: [BR, AR, IT],
      ex: [
        [["Ronaldo Nazário", "Adriano", "Júlio César", "Maicon"], ["Javier Zanetti", "Lautaro Martínez", "Diego Milito"], ["Giuseppe Bergomi", "Marco Materazzi", "Nicolò Barella", "Christian Vieri"]],
        [["Thiago Silva", "Willian", "Oscar", "Ramires"], ["Hernán Crespo", "Enzo Fernández", "Gonzalo Higuaín"], ["Gianfranco Zola", "Gianluca Vialli", "Jorginho"]],
        [["Ronaldinho", "Neymar", "Thiago Silva", "Marquinhos"], ["Lionel Messi", "Ángel Di María", "Javier Pastore"], ["Marco Verratti", "Gianluigi Donnarumma", "Thiago Motta"]],
      ],
    },
    {
      id: "almanya", title: "Bundesliga × Türkiye, Brezilya, Hollanda",
      rows: [FCBay, BVB, B04], cols: [TR, BR, NL],
      ex: [
        [["Hamit Altıntop"], ["Giovane Élber", "Lúcio", "Dante"], ["Arjen Robben", "Mark van Bommel", "Roy Makaay"]],
        [["Nuri Şahin", "Salih Özcan", "Emre Mor"], ["Dedê", "Márcio Amoroso"], ["Donyell Malen"]],
        [["Hakan Çalhanoğlu", "Yıldıray Baştürk", "Ömer Toprak"], ["Lúcio", "Zé Roberto", "Emerson"], ["Jeremie Frimpong"]],
      ],
    },
    {
      id: "ulke-mevki", title: "Brezilya, Arjantin, Fransa × Mevkiler",
      rows: [BR, AR, FR], cols: [T("Kaleci", "🧤"), T("Defans", "🛡️"), T("Forvet", "⚽")],
      ex: [
        [["Cláudio Taffarel", "Alisson Becker", "Ederson", "Júlio César", "Dida"], ["Cafu", "Roberto Carlos", "Marcelo", "Thiago Silva"], ["Pelé", "Ronaldo Nazário", "Romário", "Neymar"]],
        [["Emiliano Martínez", "Sergio Romero"], ["Javier Zanetti", "Daniel Passarella", "Roberto Ayala", "Nicolás Otamendi"], ["Lionel Messi", "Gabriel Batistuta", "Sergio Agüero", "Gonzalo Higuaín"]],
        [["Fabien Barthez", "Hugo Lloris", "Mike Maignan"], ["Lilian Thuram", "Marcel Desailly", "Laurent Blanc", "Raphaël Varane"], ["Thierry Henry", "Kylian Mbappé", "Karim Benzema", "Antoine Griezmann"]],
      ],
    },
    {
      id: "kupa-lig", title: "Kupalar × Premier Lig, Serie A, Bundesliga",
      rows: [T("Dünya Kupası kazandı", "🏆"), T("EURO kazandı", "🇪🇺"), T("Ballon d'Or kazandı", "🥇")],
      cols: [T("Premier Lig'de oynadı", "🏴"), T("Serie A'da oynadı", "🇮🇹"), T("Bundesliga'da oynadı", "🇩🇪")],
      ex: [
        [["N'Golo Kanté", "Fernando Torres", "Ángel Di María", "Paul Pogba"], ["Andrea Pirlo", "Gianluigi Buffon", "Fabio Cannavaro", "Zinedine Zidane"], ["Philipp Lahm", "Thomas Müller", "Miroslav Klose", "Benjamin Pavard"]],
        [["Cesc Fàbregas", "David Silva", "Cristiano Ronaldo", "Fernando Torres"], ["Giorgio Chiellini", "Leonardo Bonucci", "Jorginho", "Gianluigi Donnarumma"], ["Xabi Alonso", "Javi Martínez", "Dani Olmo"]],
        [["Cristiano Ronaldo", "Michael Owen", "Rodri", "George Weah"], ["Kaká", "Andriy Shevchenko", "Marco van Basten", "Cristiano Ronaldo"], ["Lothar Matthäus", "Karl-Heinz Rummenigge", "Gerd Müller", "Kevin Keegan"]],
      ],
    },
  ];
})();
