--
-- PostgreSQL database dump
--

\restrict OJh69pWIENzaEZRcnD7EG1bLCMpk8aJkZFk8FCifSQ1mbPaDl1ZJ8qFABLwMiqN

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: players; Type: TABLE; Schema: public; Owner: hockey_app
--

CREATE TABLE public.players (
    id integer NOT NULL,
    name character varying NOT NULL,
    "position" character varying NOT NULL,
    nationality character varying NOT NULL,
    jersey_number integer NOT NULL,
    birth_date date NOT NULL,
    height character varying NOT NULL,
    weight integer NOT NULL,
    handedness character varying NOT NULL,
    active_status boolean,
    regular_season_games_played integer,
    regular_season_goals integer,
    regular_season_assists integer,
    regular_season_points integer,
    playoff_games_played integer,
    playoff_goals integer,
    playoff_assists integer,
    playoff_points integer,
    games_played integer,
    goals integer,
    assists integer,
    points integer,
    team_id integer NOT NULL
);


ALTER TABLE public.players OWNER TO hockey_app;

--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: hockey_app
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO hockey_app;

--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hockey_app
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: hockey_app
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying NOT NULL,
    city character varying NOT NULL,
    conference character varying NOT NULL,
    division character varying NOT NULL,
    founded_year integer NOT NULL,
    arena character varying NOT NULL
);


ALTER TABLE public.teams OWNER TO hockey_app;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: hockey_app
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO hockey_app;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hockey_app
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: hockey_app
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: hockey_app
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: hockey_app
--

COPY public.players (id, name, "position", nationality, jersey_number, birth_date, height, weight, handedness, active_status, regular_season_games_played, regular_season_goals, regular_season_assists, regular_season_points, playoff_games_played, playoff_goals, playoff_assists, playoff_points, games_played, goals, assists, points, team_id) FROM stdin;
800012	Jarome Iginla	Right Wing	CAN	12	1977-07-01	6'0	210	R	f	82	50	48	98	7	4	5	9	89	54	53	107	4
8474150	Mikael Backlund	Center	SWE	11	1989-03-17	6'0"	206	L	t	76	15	17	32	0	0	0	0	76	15	17	32	4
8476399	Blake Coleman	Left Wing	USA	20	1991-11-28	5'11"	199	L	t	82	15	24	39	0	0	0	0	82	15	24	39	4
8482679	Matt Coronato	Right Wing	USA	27	2002-11-14	5'10"	183	R	t	77	24	23	47	0	0	0	0	77	24	23	47	4
8480797	Joel Farabee	Left Wing	USA	86	2000-02-25	6'0"	186	L	t	81	11	14	25	0	0	0	0	81	11	14	25	4
8480028	Morgan Frost	Center	CAN	16	1999-05-14	6'0"	193	L	t	81	14	23	37	0	0	0	0	81	14	23	37	4
8476456	Jonathan Huberdeau	Left Wing	CAN	10	1993-06-04	6'1"	200	L	t	81	28	34	62	0	0	0	0	81	28	34	62	4
8475172	Nazem Kadri	Center	CAN	91	1990-10-06	6'0"	185	L	t	82	35	32	67	0	0	0	0	82	35	32	67	4
8477993	Justin Kirkland	Center	CAN	58	1996-08-02	6'3"	183	L	t	21	2	6	8	0	0	0	0	21	2	6	8	4
8479066	Ryan Lomberg	Left Wing	CAN	70	1994-12-09	5'9"	184	L	t	80	3	10	13	0	0	0	0	80	3	10	13	4
8477511	Anthony Mantha	Right Wing	CAN	39	1994-09-16	6'5"	240	L	t	13	4	3	7	0	0	0	0	13	4	3	7	4
8481028	Martin Pospisil	Center	SVK	76	1999-11-19	6'2"	173	L	t	81	4	21	25	0	0	0	0	81	4	21	25	4
8479291	Kevin Rooney	Center	USA	21	1993-05-21	6'2"	190	L	t	70	5	5	10	0	0	0	0	70	5	5	10	4
8481068	Yegor Sharangovich	Center	BLR	17	1998-06-06	6'2"	196	L	t	73	17	15	32	0	0	0	0	73	17	15	32	4
8484234	Aydar Suniev	Left Wing	RUS	36	2004-11-16	6'2"	198	L	t	1	0	0	0	0	0	0	0	1	0	0	0	4
8482074	Connor Zary	Center	CAN	47	2001-09-25	6'0"	178	L	t	54	13	14	27	0	0	0	0	54	13	14	27	4
8478397	Rasmus Andersson	Defense	SWE	4	1996-10-27	6'1"	202	R	t	81	11	20	31	0	0	0	0	81	11	20	31	4
8480860	Kevin Bahl	Defense	CAN	7	2000-06-27	6'6"	230	L	t	73	3	17	20	0	0	0	0	73	3	17	20	4
8479402	Jake Bean	Defense	CAN	24	1998-06-09	6'1"	191	L	t	64	2	5	7	0	0	0	0	64	2	5	7	4
8477810	Joel Hanley	Defense	CAN	44	1991-06-08	5'11"	186	L	t	53	2	7	9	0	0	0	0	53	2	7	9	4
8482624	Daniil Miromanov	Defense	RUS	62	1997-07-11	6'4"	207	R	t	44	2	7	9	0	0	0	0	44	2	7	9	4
8481167	Brayden Pachal	Defense	CAN	94	1999-08-23	6'2"	202	R	t	76	3	9	12	0	0	0	0	76	3	9	12	4
8484768	Zayne Parekh	Defense	CAN	89	2006-02-15	6'0"	179	R	t	1	1	0	1	0	0	0	0	1	1	0	1	4
8482470	Ilya Solovyov	Defense	BLR	98	2000-07-20	6'3"	208	L	t	5	0	1	1	0	0	0	0	5	0	1	1	4
8477346	MacKenzie Weegar	Defense	CAN	52	1994-01-07	6'0"	206	R	t	81	8	39	47	0	0	0	0	81	8	39	47	4
8478435	Dan Vladar	Goalie	CZE	80	1997-08-20	6'5"	209	L	t	30	0	1	1	0	0	0	0	30	0	1	1	4
8481692	Dustin Wolf	Goalie	USA	32	2001-04-16	6'0"	166	L	t	53	0	3	3	0	0	0	0	53	0	3	3	4
800099	Wayne Gretzky	Center	CAN	99	1961-01-26	6'0	185	R	f	80	52	163	215	10	8	11	19	90	60	174	234	11
8478042	Viktor Arvidsson	Left Wing	SWE	33	1993-04-08	5'10"	181	R	t	67	15	12	27	15	2	5	7	82	17	17	34	11
8477015	Connor Brown	Right Wing	CAN	28	1994-01-14	6'0"	184	R	t	82	13	17	30	20	5	4	9	102	18	21	39	11
8477934	Leon Draisaitl	Center	GER	29	1995-10-27	6'2"	209	L	t	71	52	54	106	22	11	22	33	93	63	76	139	11
8479365	Trent Frederic	Center	USA	10	1998-02-11	6'3"	221	L	t	58	8	7	15	22	1	3	4	80	9	10	19	11
8480468	James Hamblin	Left Wing	CAN	52	1999-04-27	5'10"	185	L	t	0	0	0	0	0	0	0	0	0	0	0	0	11
8474641	Adam Henrique	Center	CAN	19	1990-02-06	6'0"	195	L	t	81	12	15	27	22	4	3	7	103	16	18	34	11
8475786	Zach Hyman	Left Wing	CAN	18	1992-06-09	6'1"	206	R	t	73	27	17	44	15	5	6	11	88	32	23	55	11
8477406	Mattias Janmark	Center	SWE	13	1992-12-08	6'2"	205	L	t	80	2	16	18	22	3	1	4	102	5	17	22	11
8479368	Max Jones	Left Wing	USA	46	1998-02-17	6'3"	216	L	t	26	1	1	2	0	0	0	0	26	1	1	2	11
8477953	Kasperi Kapanen	Right Wing	FIN	42	1996-07-23	6'1"	194	R	t	67	6	8	14	12	3	3	6	79	9	11	20	11
8478402	Connor McDavid	Center	CAN	97	1997-01-13	6'1"	194	L	t	67	26	74	100	22	7	26	33	89	33	100	133	11
8476454	Ryan Nugent-Hopkins	Center	CAN	93	1993-04-12	6'1"	192	L	t	78	20	29	49	22	6	14	20	100	26	43	69	11
8470621	Corey Perry	Right Wing	CAN	90	1985-05-16	6'3"	208	R	t	81	19	11	30	22	10	4	14	103	29	15	44	11
8481491	Noah Philp	Center	CAN	48	1998-08-31	6'3"	198	R	t	15	0	2	2	0	0	0	0	15	0	2	2	11
8481617	Vasily Podkolzin	Right Wing	RUS	92	2001-06-24	6'1"	190	L	t	82	8	16	24	22	3	7	10	104	11	23	34	11
8478585	Derek Ryan	Center	USA	10	1986-12-29	5'10"	185	R	t	36	1	5	6	0	0	0	0	36	1	5	6	11
8483512	Matt Savoie	Center	CAN	22	2004-01-01	5'10"	179	R	t	4	0	1	1	0	0	0	0	4	0	1	1	11
8475784	Jeff Skinner	Center	CAN	53	1992-05-16	5'11"	200	L	t	72	16	13	29	5	1	1	2	77	17	14	31	11
8480803	Evan Bouchard	Defense	CAN	2	1999-10-20	6'3"	192	R	t	82	14	53	67	22	7	16	23	104	21	69	90	11
8477384	Joshua Brown	Defense	CAN	44	1994-01-21	6'5"	220	R	t	10	0	1	1	1	0	0	0	11	0	1	1	11
8479341	Cam Dineen	Defense	USA	85	1998-06-19	5'11"	188	L	t	4	0	0	0	0	0	0	0	4	0	0	0	11
8475218	Mattias Ekholm	Defense	SWE	14	1990-05-24	6'5"	225	L	t	65	9	24	33	7	1	5	6	72	10	29	39	11
8480834	Ty Emberson	Defense	USA	49	2000-05-23	6'0"	193	R	t	76	2	11	13	9	0	0	0	85	2	11	13	11
8475906	John Klingberg	Defense	SWE	36	1992-08-14	6'2"	185	R	t	11	1	3	4	19	1	3	4	30	2	6	8	11
8476967	Brett Kulak	Defense	CAN	27	1994-01-06	6'2"	192	L	t	82	7	18	25	22	1	4	5	104	8	22	30	11
8477498	Darnell Nurse	Defense	CAN	25	1995-02-04	6'4"	215	L	t	76	5	28	33	22	3	5	8	98	8	33	41	11
8479442	Troy Stecher	Defense	CAN	51	1994-04-07	5'10"	184	R	t	66	3	4	7	8	0	0	0	74	3	4	7	11
8478013	Jake Walman	Defense	CAN	96	1996-02-20	6'1"	218	L	t	65	7	33	40	22	2	8	10	87	9	41	50	11
8475717	Calvin Pickard	Goalie	CAN	30	1992-04-15	6'1"	206	L	t	36	0	1	1	10	0	0	0	46	0	1	1	11
8480885	Olivier Rodrigue	Goalie	CAN	35	2000-07-06	6'1"	158	L	t	2	0	0	0	0	0	0	0	2	0	0	0	11
8479973	Stuart Skinner	Goalie	CAN	74	1998-11-01	6'4"	215	L	t	51	0	0	0	15	0	0	0	66	0	0	0	11
800009	Maurice Richard	Right Wing	CAN	9	1921-08-04	5'10	180	L	f	70	38	33	71	10	5	9	14	80	43	42	85	15
8476981	Josh Anderson	Right Wing	CAN	17	1994-05-07	6'3"	226	R	t	81	15	12	27	5	0	1	1	86	15	13	28	15
8476469	Joel Armia	Right Wing	FIN	40	1993-05-31	6'3"	216	R	t	81	11	18	29	5	0	2	2	86	11	20	31	15
8481540	Cole Caufield	Right Wing	USA	13	2001-01-02	5'8"	175	R	t	82	37	33	70	5	3	1	4	87	40	34	74	15
8481523	Kirby Dach	Center	CAN	77	2001-01-21	6'4"	221	R	t	57	10	12	22	0	0	0	0	57	10	12	22	15
8484984	Ivan Demidov	Right Wing	RUS	93	2005-12-10	6'1"	192	L	t	2	1	1	2	5	0	2	2	7	1	3	4	15
8477989	Christian Dvorak	Center	USA	28	1996-02-02	6'1"	190	L	t	82	12	21	33	5	2	0	2	87	14	21	35	15
8478133	Jake Evans	Center	CAN	71	1996-06-02	6'0"	190	R	t	82	13	23	36	5	0	1	1	87	13	24	37	15
8475848	Brendan Gallagher	Right Wing	CAN	11	1992-05-06	5'9"	185	R	t	82	21	17	38	5	0	2	2	87	21	19	40	15
8479339	Patrik Laine	Right Wing	FIN	92	1998-04-19	6'4"	208	R	t	52	20	13	33	2	0	1	1	54	20	14	34	15
8481618	Alex Newhook	Center	CAN	15	2001-01-28	5'11"	200	L	t	82	15	11	26	5	1	1	2	87	16	12	28	15
8479543	Michael Pezzetta	Left Wing	CAN	55	1998-03-13	6'1"	222	L	t	25	0	0	0	0	0	0	0	25	0	0	0	15
8483515	Juraj Slafkovský	Left Wing	SVK	20	2004-03-30	6'3"	225	L	t	79	18	33	51	5	2	0	2	84	20	33	53	15
8480018	Nick Suzuki	Center	CAN	14	1999-08-10	5'11"	207	R	t	82	30	59	89	5	2	0	2	87	32	59	91	15
8478851	Alexandre Carrier	Defense	CAN	45	1996-10-08	5'11"	174	R	t	79	3	22	25	5	1	1	2	84	4	23	27	15
8480865	Noah Dobson	Defense	CAN	53	2000-01-07	6'4"	200	R	t	71	10	29	39	0	0	0	0	71	10	29	39	15
8482087	Kaiden Guhle	Defense	CAN	21	2002-01-18	6'3"	202	L	t	55	6	12	18	5	0	0	0	60	6	12	18	15
8483457	Lane Hutson	Defense	USA	48	2004-02-14	5'9"	162	L	t	82	6	60	66	5	0	5	5	87	6	65	71	15
8476875	Mike Matheson	Defense	CAN	8	1994-02-27	6'2"	196	L	t	80	6	25	31	5	0	1	1	85	6	26	32	15
8475233	David Savard	Defense	CAN	58	1990-10-22	6'1"	235	R	t	75	1	14	15	5	0	1	1	80	1	15	16	15
8481593	Jayden Struble	Defense	USA	47	2001-09-08	6'0"	207	L	t	56	2	11	13	2	0	0	0	58	2	11	13	15
8482964	Arber Xhekaj	Defense	CAN	72	2001-01-30	6'4"	240	L	t	70	1	5	6	3	0	0	0	73	1	5	6	15
8482487	Jakub Dobes	Goalie	CZE	75	2001-05-27	6'4"	215	L	t	16	0	0	0	3	0	0	0	19	0	0	0	15
8478470	Sam Montembeault	Goalie	CAN	35	1996-10-30	6'3"	218	L	t	62	0	1	1	3	0	0	0	65	0	1	1	15
800011	Daniel Alfredsson	Right Wing	SWE	11	1990-01-01	5'11	200	R	f	77	43	60	103	10	2	8	10	87	45	68	113	20
8478020	Michael Amadio	Right Wing	CAN	22	1996-05-13	6'1"	206	R	t	72	11	16	27	6	0	1	1	78	11	17	28	20
8480208	Drake Batherson	Right Wing	USA	19	1998-04-27	6'3"	209	R	t	82	26	42	68	6	1	1	2	88	27	43	70	20
8483579	Wyatt Bongiovanni	Left Wing	USA	49	1999-07-24	6'0"	197	L	t	0	0	0	0	0	0	0	0	0	0	0	0	20
8482674	Tyler Boucher	Right Wing	USA	54	2003-01-16	6'2"	216	R	t	0	0	0	0	0	0	0	0	0	0	0	0	20
8476393	Nick Cousins	Center	CAN	21	1993-07-20	5'11"	191	L	t	50	6	9	15	5	0	0	0	55	6	9	15	20
8481528	Dylan Cozens	Center	CAN	24	2001-02-09	6'3"	205	R	t	82	16	31	47	6	1	1	2	88	17	32	49	20
8481065	Angus Crookshank	Left Wing	CAN	59	1999-10-02	5'10"	183	L	t	8	0	1	1	0	0	0	0	8	0	1	1	20
8478874	Adam Gaudette	Right Wing	USA	81	1996-10-03	6'1"	187	R	t	81	19	7	26	6	1	2	3	87	20	9	29	20
8473512	Claude Giroux	Right Wing	CAN	28	1988-01-12	5'11"	186	R	t	81	15	35	50	6	1	4	5	87	16	39	55	20
8482092	Ridly Greig	Center	CAN	71	2002-08-08	6'0"	184	L	t	78	13	21	34	6	1	0	1	84	14	21	35	20
8483676	Stephen Halliday	Center	CAN	83	2002-07-02	6'4"	214	L	t	0	0	0	0	0	0	0	0	0	0	0	0	20
8478146	Matthew Highmore	Center	CAN	15	1996-02-27	5'11"	192	L	t	41	2	4	6	1	0	0	0	42	2	4	6	20
8478173	Hayden Hodgson	Right Wing	CAN	42	1996-03-02	6'2"	226	R	t	2	0	0	0	0	0	0	0	2	0	0	0	20
8480890	Jan Jenik	Center	CZE	14	2000-09-15	6'1"	204	L	t	2	0	0	0	0	0	0	0	2	0	0	0	20
8479772	Zack MacEwen	Right Wing	CAN	17	1996-07-08	6'4"	226	R	t	21	2	1	3	0	0	0	0	21	2	1	3	20
8474102	David Perron	Left Wing	CAN	57	1988-05-28	6'0"	202	R	t	43	9	7	16	6	2	1	3	49	11	8	19	20
8479516	Garrett Pilon	Center	USA	45	1998-04-13	5'11"	209	R	t	0	0	0	0	0	0	0	0	0	0	0	0	20
8481596	Shane Pinto	Center	USA	12	2000-11-12	6'3"	206	R	t	70	21	16	37	6	1	1	2	76	22	17	39	20
8481133	Cole Reinhardt	Left Wing	CAN	51	2000-02-01	6'1"	207	L	t	17	1	1	2	0	0	0	0	17	1	1	2	20
8482116	Tim Stützle	Center	GER	18	2002-01-15	6'0"	187	L	t	82	24	55	79	6	2	3	5	88	26	58	84	20
8480801	Brady Tkachuk	Left Wing	USA	7	1999-09-16	6'4"	226	L	t	72	29	26	55	6	4	3	7	78	33	29	62	20
8480188	Fabian Zetterlund	Left Wing	SWE	20	1999-08-25	5'11"	208	R	t	84	19	22	41	6	0	0	0	90	19	22	41	20
8478469	Thomas Chabot	Defense	CAN	72	1997-01-30	6'1"	200	L	t	80	9	36	45	6	1	3	4	86	10	39	49	20
8478502	Dennis Gilbert	Defense	USA	6	1996-10-30	6'2"	216	L	t	29	0	6	6	0	0	0	0	29	0	6	6	20
8483683	Tomas Hamara	Defense	CZE	98	2004-03-09	6'0"	194	L	t	0	0	0	0	0	0	0	0	0	0	0	0	20
8474612	Travis Hamonic	Defense	CAN	23	1990-08-16	6'0"	195	R	t	59	1	6	7	0	0	0	0	59	1	6	7	20
8475324	Nick Jensen	Defense	USA	3	1990-09-21	6'0"	202	R	t	71	3	18	21	6	0	0	0	77	3	18	21	20
8482095	Tyler Kleven	Defense	USA	43	2002-01-10	6'5"	225	L	t	79	4	6	10	6	0	2	2	85	4	8	12	20
8484321	Nikolas Matinpalo	Defense	FIN	33	1998-10-05	6'3"	213	R	t	41	1	3	4	6	0	0	0	47	1	3	4	20
8482105	Jake Sanderson	Defense	USA	85	2002-07-08	6'2"	202	L	t	80	11	46	57	6	1	2	3	86	12	48	60	20
8482131	Donovan Sebrango	Defense	CAN	37	2002-01-12	6'2"	223	L	t	2	0	0	0	0	0	0	0	2	0	0	0	20
8481606	Jordan Spence	Defense	AUS	0	2001-02-24	5'11"	188	R	t	79	4	24	28	5	1	0	1	84	5	24	29	20
8484759	Carter Yakemchuk	Defense	CAN	58	2005-09-29	6'3"	219	R	t	0	0	0	0	0	0	0	0	0	0	0	0	20
8482245	Artem Zub	Defense	RUS	2	1995-10-03	6'3"	201	R	t	56	2	11	13	6	0	1	1	62	2	12	14	20
8476341	Anton Forsberg	Goalie	SWE	31	1992-11-27	6'3"	198	L	t	30	0	0	0	0	0	0	0	30	0	0	0	20
8482447	Leevi Meriläinen	Goalie	FIN	1	2002-08-13	6'2"	196	L	t	12	0	0	0	0	0	0	0	12	0	0	0	20
8481544	Mads Sogaard	Goalie	DEN	40	2000-12-13	6'7"	231	L	t	2	0	0	0	0	0	0	0	2	0	0	0	20
8476999	Linus Ullmark	Goalie	SWE	35	1993-07-31	6'4"	223	L	t	44	0	2	2	6	0	0	0	50	0	2	2	20
800027	Darryl Sittler	Center	CAN	27	1950-09-18	6'0	190	R	f	80	45	72	117	13	3	8	11	93	48	80	128	27
8481720	Nick Abruzzese	Center	USA	26	1999-06-04	5'10"	178	L	t	0	0	0	0	0	0	0	0	0	0	0	0	27
8477503	Max Domi	Center	CAN	11	1995-03-02	5'10"	208	L	t	74	8	25	33	13	3	4	7	87	11	29	40	27
8482130	Roni Hirvonen	Center	FIN	33	2002-01-10	5'10"	178	L	t	0	0	0	0	0	0	0	0	0	0	0	0	27
8480995	Pontus Holmberg	Right Wing	SWE	29	1999-03-09	6'0"	201	L	t	68	7	12	19	12	0	1	1	80	7	13	20	27
8475714	Calle Jarnkrok	Center	SWE	19	1991-09-25	6'0"	193	R	t	19	1	6	7	12	0	1	1	31	1	7	8	27
8481147	Reese Johnson	Center	CAN	71	1998-07-10	6'1"	193	R	t	3	0	0	0	0	0	0	0	3	0	0	0	27
8480144	David Kampf	Center	CZE	64	1995-01-12	6'2"	198	L	t	59	5	8	13	1	0	0	0	60	5	8	13	27
8482720	Matthew Knies	Left Wing	USA	23	2002-10-17	6'3"	232	L	t	78	29	29	58	13	5	2	7	91	34	31	65	27
8476872	Scott Laughton	Left Wing	CAN	24	1994-05-30	6'1"	190	L	t	80	13	18	31	13	0	2	2	93	13	20	33	27
8478904	Steven Lorentz	Center	CAN	18	1996-04-13	6'4"	219	L	t	80	8	11	19	13	0	2	2	93	8	13	21	27
8481711	Matias Maccelli	Left Wing	FIN	0	2000-10-14	5'11"	187	L	t	55	8	10	18	0	0	0	0	55	8	10	18	27
8478483	Mitch Marner	Right Wing	CAN	16	1997-05-05	6'0"	180	R	t	81	27	75	102	13	2	11	13	94	29	86	115	27
8479318	Auston Matthews	Center	USA	34	1997-09-17	6'3"	215	L	t	67	33	45	78	13	3	8	11	80	36	53	89	27
8482259	Bobby McMann	Center	CAN	74	1996-06-15	6'2"	217	L	t	74	20	14	34	13	0	3	3	87	20	17	37	27
8479423	Alex Nylander	Left Wing	CAN	92	1998-03-02	6'1"	205	R	t	5	0	0	0	0	0	0	0	5	0	0	0	27
8477939	William Nylander	Right Wing	CAN	88	1996-05-01	6'0"	200	R	t	82	45	39	84	13	6	9	15	95	51	48	99	27
8474157	Max Pacioretty	Left Wing	USA	67	1988-11-20	6'2"	217	L	t	37	5	8	13	11	3	5	8	48	8	13	21	27
8484901	Jacob Quillan	Center	CAN	61	2002-02-02	6'1"	204	L	t	1	0	0	0	0	0	0	0	1	0	0	0	27
8471817	Ryan Reaves	Right Wing	CAN	75	1987-01-20	6'2"	225	R	t	35	0	2	2	0	0	0	0	35	0	2	2	27
8481582	Nicholas Robertson	Left Wing	USA	89	2001-09-11	5'9"	180	L	t	69	15	7	22	3	1	1	2	72	16	8	24	27
8482634	Alex Steeves	Center	USA	46	1999-12-10	6'0"	199	L	t	7	1	1	2	0	0	0	0	7	1	1	2	27
8475166	John Tavares	Center	CAN	91	1990-09-20	6'1"	217	L	t	75	38	36	74	13	5	2	7	88	43	38	81	27
8476988	Matt Benning	Defense	CAN	55	1994-05-25	6'1"	220	R	t	7	0	0	0	0	0	0	0	7	0	0	0	27
8481122	Simon Benoit	Defense	CAN	2	1998-09-19	6'4"	210	L	t	78	1	9	10	13	1	1	2	91	2	10	12	27
8478443	Brandon Carlo	Defense	USA	25	1996-11-26	6'5"	227	R	t	83	1	11	12	13	0	0	0	96	1	11	12	27
8475171	Oliver Ekman-Larsson	Defense	SWE	95	1991-07-17	6'2"	190	L	t	77	4	25	29	13	2	2	4	90	6	27	33	27
8475825	Jani Hakanpää	Defense	FIN	28	1992-03-31	6'7"	225	R	t	2	0	0	0	0	0	0	0	2	0	0	0	27
8481614	Mikko Kokkonen	Defense	FIN	84	2001-01-18	6'0"	200	L	t	0	0	0	0	0	0	0	0	0	0	0	0	27
8476931	Jake McCabe	Defense	USA	22	1993-10-12	6'1"	210	L	t	66	2	21	23	13	0	4	4	79	2	25	27	27
8477541	Dakota Mermis	Defense	USA	36	1994-01-05	6'0"	197	L	t	4	0	1	1	0	0	0	0	4	0	1	1	27
8479026	Philippe Myers	Defense	CAN	51	1997-01-25	6'5"	221	R	t	36	2	3	5	0	0	0	0	36	2	3	5	27
8482158	Topi Niemela	Defense	FIN	47	2002-03-25	6'0"	179	R	t	0	0	0	0	0	0	0	0	0	0	0	0	27
8476853	Morgan Rielly	Defense	CAN	44	1994-03-09	6'1"	219	L	t	82	7	34	41	13	4	3	7	95	11	37	48	27
8483546	Marshall Rifai	Defense	CAN	83	1998-03-16	6'2"	211	L	t	0	0	0	0	0	0	0	0	0	0	0	0	27
8475690	Chris Tanev	Defense	CAN	8	1989-12-20	6'3"	200	R	t	75	3	15	18	13	1	2	3	88	4	17	21	27
8482174	William Villeneuve	Defense	CAN	76	2002-03-20	6'2"	183	R	t	0	0	0	0	0	0	0	0	0	0	0	0	27
8481570	Cade Webber	Defense	USA	52	2001-01-05	6'7"	212	L	t	0	0	0	0	0	0	0	0	0	0	0	0	27
8482515	Artur Akhtyamov	Goalie	RUS	70	2001-10-31	6'2"	170	L	t	0	0	0	0	0	0	0	0	0	0	0	0	27
8483710	Dennis Hildeby	Goalie	SWE	35	2001-08-19	6'7"	231	L	t	6	0	0	0	0	0	0	0	6	0	0	0	27
8476899	Matt Murray	Goalie	CAN	30	1994-05-25	6'5"	220	L	t	2	0	0	0	1	0	0	0	3	0	0	0	27
8476932	Anthony Stolarz	Goalie	USA	41	1994-01-20	6'6"	248	L	t	34	0	1	1	7	0	0	0	41	0	1	1	27
8479361	Joseph Woll	Goalie	USA	60	1998-07-12	6'3"	212	L	t	42	0	0	0	7	0	0	0	49	0	0	0	27
800016	Trevor Linden	Center	CAN	16	1961-01-26	6'0	210	R	f	82	33	47	80	6	4	4	8	88	37	51	88	29
8482496	Nils Aman	Center	SWE	88	2000-02-07	6'2"	179	L	t	19	1	5	6	0	0	0	0	19	1	5	6	29
8476927	Teddy Blueger	Center	LAT	53	1994-08-15	6'0"	185	L	t	82	8	18	26	0	0	0	0	82	8	18	26	29
8478444	Brock Boeser	Right Wing	USA	6	1997-02-25	6'1"	208	R	t	75	25	25	50	0	0	0	0	75	25	25	50	29
8480078	Filip Chytil	Center	CZE	72	1999-09-05	6'2"	210	L	t	56	13	13	26	0	0	0	0	56	13	13	26	29
8478498	Jake DeBrusk	Left Wing	CAN	74	1996-10-17	6'1"	198	L	t	82	28	20	48	0	0	0	0	82	28	20	48	29
8478856	Conor Garland	Right Wing	USA	8	1996-03-11	5'10"	165	R	t	81	19	31	50	0	0	0	0	81	19	31	50	29
8481535	Nils Hoglander	Left Wing	SWE	21	2000-12-20	5'9"	185	L	t	72	8	17	25	0	0	0	0	72	8	17	25	29
8478057	Dakota Joshua	Center	USA	81	1996-05-15	6'3"	218	L	t	57	7	7	14	0	0	0	0	57	7	7	14	29
8475169	Evander Kane	Left Wing	CAN	0	1991-08-02	6'2"	218	L	t	0	0	0	0	21	6	6	12	21	6	6	12	29
8482055	Drew O'Connor	Left Wing	USA	18	1998-06-09	6'4"	209	L	t	84	10	15	25	0	0	0	0	84	10	15	25	29
8480012	Elias Pettersson	Center	SWE	40	1998-11-12	6'2"	176	L	t	64	15	30	45	0	0	0	0	64	15	30	45	29
8480748	Kiefer Sherwood	Left Wing	USA	44	1995-03-31	6'0"	194	R	t	78	19	21	40	0	0	0	0	78	19	21	40	29
8480459	Pius Suter	Center	SUI	24	1996-05-24	5'11"	172	L	t	81	25	21	46	0	0	0	0	81	25	21	46	29
8475762	Derek Forbort	Defense	USA	27	1992-03-04	6'4"	216	L	t	54	2	9	11	0	0	0	0	54	2	9	11	29
8479425	Filip Hronek	Defense	CZE	17	1997-11-02	6'0"	190	R	t	61	5	28	33	0	0	0	0	61	5	28	33	29
8480800	Quinn Hughes	Defense	USA	43	1999-10-14	5'10"	180	L	t	68	16	60	76	0	0	0	0	68	16	60	76	29
8478454	Noah Juulsen	Defense	CAN	47	1997-04-02	6'2"	201	R	t	35	0	0	0	0	0	0	0	35	0	0	0	29
8474574	Tyler Myers	Defense	USA	57	1990-02-01	6'8"	229	R	t	71	6	18	24	0	0	0	0	71	6	18	24	29
8483678	Elias Pettersson	Defense	SWE	25	2004-02-16	6'2"	185	L	t	28	1	2	3	0	0	0	0	28	1	2	3	29
8477969	Marcus Pettersson	Defense	SWE	29	1996-05-08	6'5"	174	L	t	78	4	25	29	0	0	0	0	78	4	25	29	29
8477967	Thatcher Demko	Goalie	USA	35	1995-12-08	6'4"	192	L	t	23	0	0	0	0	0	0	0	23	0	0	0	29
8480947	Kevin Lankinen	Goalie	FIN	32	1995-04-28	6'2"	190	L	t	51	0	1	1	0	0	0	0	51	0	1	1	29
800010	Dale Hawerchuk	Center	CAN	10	1963-04-04	5'11	185	L	f	80	53	77	130	3	2	1	3	83	55	78	133	32
8479994	Jaret Anderson-Dolan	Center	CAN	28	1999-09-12	5'11"	200	L	t	7	0	1	1	5	1	1	2	12	1	2	3	32
8478891	Mason Appleton	Center	USA	22	1996-01-15	6'2"	194	R	t	71	10	12	22	13	0	7	7	84	10	19	29	32
8480289	Morgan Barron	Center	CAN	36	1998-12-02	6'4"	220	L	t	74	8	7	15	13	0	2	2	87	8	9	17	32
8478398	Kyle Connor	Left Wing	USA	81	1996-12-09	6'1"	183	L	t	82	41	56	97	13	5	12	17	95	46	68	114	32
8477940	Nikolaj Ehlers	Left Wing	DEN	27	1996-02-14	6'0"	172	L	t	69	24	39	63	8	5	2	7	77	29	41	70	32
8484135	Parker Ford	Center	USA	73	2000-07-20	5'9"	181	R	t	3	1	0	1	0	0	0	0	3	1	0	1	32
8481019	David Gustafsson	Center	SWE	19	2000-04-11	6'2"	196	L	t	36	2	4	6	4	1	0	1	40	3	4	7	32
8480113	Alex Iafallo	Left Wing	USA	9	1993-12-21	6'0"	201	L	t	82	15	16	31	13	1	1	2	95	16	17	33	32
8480845	Rasmus Kupari	Center	FIN	15	2000-03-15	6'2"	201	R	t	59	5	3	8	0	0	0	0	59	5	3	8	32
8476392	Adam Lowry	Center	USA	17	1993-03-29	6'5"	210	L	t	73	16	18	34	13	4	0	4	86	20	18	38	32
8476480	Vladislav Namestnikov	Center	RUS	7	1992-11-22	6'0"	181	L	t	78	11	27	38	13	3	3	6	91	14	30	44	32
8475799	Nino Niederreiter	Right Wing	SUI	62	1992-09-08	6'2"	218	L	t	82	17	20	37	13	4	2	6	95	21	22	43	32
8482149	Cole Perfetti	Center	CAN	91	2002-01-01	5'11"	185	L	t	82	18	32	50	13	3	3	6	95	21	35	56	32
8476460	Mark Scheifele	Center	CAN	55	1993-03-15	6'3"	207	R	t	82	39	48	87	11	5	6	11	93	44	54	98	32
8479972	Mason Shaw	Center	CAN	23	1998-11-03	5'10"	184	L	t	0	0	0	0	0	0	0	0	0	0	0	0	32
8479293	Brandon Tanev	Left Wing	CAN	73	1991-12-31	6'0"	189	L	t	79	10	12	22	13	0	0	0	92	10	12	22	32
8476952	Dominic Toninato	Center	USA	21	1994-03-09	6'2"	201	L	t	5	0	0	0	2	0	0	0	7	0	0	0	32
8480014	Gabriel Vilardi	Center	CAN	13	1999-08-16	6'3"	216	R	t	71	27	34	61	9	1	3	4	80	28	37	65	32
8484242	Brayden Yager	Center	CAN	29	2005-01-03	5'11"	180	R	t	0	0	0	0	0	0	0	0	0	0	0	0	32
8479639	Dylan Coghlan	Defense	CAN	52	1998-02-19	6'2"	205	R	t	6	0	0	0	0	0	0	0	6	0	0	0	32
8476331	Dylan DeMelo	Defense	CAN	2	1993-05-01	6'1"	194	R	t	82	3	16	19	12	1	3	4	94	4	19	23	32
8477938	Haydn Fleury	Defense	CAN	24	1996-07-08	6'4"	207	L	t	39	0	7	7	8	0	2	2	47	0	9	9	32
8481572	Ville Heinola	Defense	FIN	14	2001-03-02	6'0"	181	L	t	18	0	1	1	0	0	0	0	18	0	1	1	32
8476525	Colin Miller	Defense	CAN	6	1992-10-29	6'1"	200	R	t	60	4	11	15	4	0	2	2	64	4	13	17	32
8477504	Josh Morrissey	Defense	CAN	44	1995-03-28	6'0"	195	L	t	80	14	48	62	12	0	6	6	92	14	54	68	32
8482192	Isaak Phillips	Defense	CAN	0	2001-09-28	6'3"	205	L	t	3	1	0	1	0	0	0	0	3	1	0	1	32
8480145	Neal Pionk	Defense	USA	4	1995-07-29	6'0"	190	R	t	69	10	29	39	13	1	6	7	82	11	35	46	32
8483510	Elias Salomonsson	Defense	SWE	57	2004-08-31	6'0"	172	R	t	0	0	0	0	0	0	0	0	0	0	0	0	32
8480049	Dylan Samberg	Defense	USA	54	1999-01-24	6'4"	216	L	t	60	6	14	20	13	0	3	3	73	6	17	23	32
8474568	Luke Schenn	Defense	CAN	5	1989-11-02	6'2"	225	R	t	76	1	6	7	11	0	1	1	87	1	7	8	32
8479378	Logan Stanley	Defense	CAN	64	1998-05-26	6'7"	231	L	t	63	1	13	14	5	0	0	0	68	1	13	14	32
8477480	Eric Comrie	Goalie	CAN	1	1995-07-06	6'1"	190	L	t	20	0	0	0	3	0	0	0	23	0	0	0	32
8476904	Chris Driedger	Goalie	CAN	60	1994-05-18	6'4"	210	L	t	0	0	0	0	0	0	0	0	0	0	0	0	32
8476945	Connor Hellebuyck	Goalie	USA	37	1993-05-19	6'4"	207	L	t	63	0	1	1	13	0	0	0	76	0	1	1	32
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: hockey_app
--

COPY public.teams (id, name, city, conference, division, founded_year, arena) FROM stdin;
1	Anaheim Ducks	Anaheim	Western	Pacific	1993	Honda Center
2	Boston Bruins	Boston	Eastern	Atlantic	1924	TD Garden
3	Buffalo Sabres	Buffalo	Eastern	Atlantic	1970	KeyBank Center
4	Calgary Flames	Calgary	Western	Pacific	1972	Scotiabank Saddledome
5	Carolina Hurricanes	Raleigh	Eastern	Metropolitan	1972	PNC Arena
6	Chicago Blackhawks	Chicago	Western	Central	1926	United Center
7	Colorado Avalanche	Denver	Western	Central	1972	Ball Arena
8	Columbus Blue Jackets	Columbus	Eastern	Metropolitan	2000	Nationwide Arena
9	Dallas Stars	Dallas	Western	Central	1967	American Airlines Center
10	Detroit Red Wings	Detroit	Eastern	Atlantic	1926	Little Caesars Arena
11	Edmonton Oilers	Edmonton	Western	Pacific	1972	Rogers Place
12	Florida Panthers	Sunrise	Eastern	Atlantic	1993	Amerant Bank Arena
13	Los Angeles Kings	Los Angeles	Western	Pacific	1967	Crypto.com Arena
14	Minnesota Wild	Saint Paul	Western	Central	2000	Xcel Energy Center
15	Montreal Canadiens	Montreal	Eastern	Atlantic	1909	Bell Centre
16	Nashville Predators	Nashville	Western	Central	1998	Bridgestone Arena
17	New Jersey Devils	Newark	Eastern	Metropolitan	1974	Prudential Center
18	New York Islanders	Elmont	Eastern	Metropolitan	1972	UBS Arena
19	New York Rangers	New York	Eastern	Metropolitan	1926	Madison Square Garden
20	Ottawa Senators	Ottawa	Eastern	Atlantic	1992	Canadian Tire Centre
21	Philadelphia Flyers	Philadelphia	Eastern	Metropolitan	1967	Wells Fargo Center
22	Pittsburgh Penguins	Pittsburgh	Eastern	Metropolitan	1967	PPG Paints Arena
23	San Jose Sharks	San Jose	Western	Pacific	1991	SAP Center
24	Seattle Kraken	Seattle	Western	Pacific	2021	Climate Pledge Arena
25	St. Louis Blues	St. Louis	Western	Central	1967	Enterprise Center
26	Tampa Bay Lightning	Tampa	Eastern	Atlantic	1992	Amalie Arena
27	Toronto Maple Leafs	Toronto	Eastern	Atlantic	1917	Scotiabank Arena
28	Utah Hockey Club	Salt Lake City	Western	Central	1972	Delta Center
29	Vancouver Canucks	Vancouver	Western	Pacific	1970	Rogers Arena
30	Vegas Golden Knights	Las Vegas	Western	Pacific	2017	T-Mobile Arena
31	Washington Capitals	Washington	Eastern	Metropolitan	1974	Capital One Arena
32	Winnipeg Jets	Winnipeg	Western	Central	1999	Canada Life Centre
\.


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hockey_app
--

SELECT pg_catalog.setval('public.players_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hockey_app
--

SELECT pg_catalog.setval('public.teams_id_seq', 1, false);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: hockey_app
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: hockey_app
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: ix_players_id; Type: INDEX; Schema: public; Owner: hockey_app
--

CREATE INDEX ix_players_id ON public.players USING btree (id);


--
-- Name: ix_players_name; Type: INDEX; Schema: public; Owner: hockey_app
--

CREATE INDEX ix_players_name ON public.players USING btree (name);


--
-- Name: ix_teams_id; Type: INDEX; Schema: public; Owner: hockey_app
--

CREATE INDEX ix_teams_id ON public.teams USING btree (id);


--
-- Name: ix_teams_name; Type: INDEX; Schema: public; Owner: hockey_app
--

CREATE INDEX ix_teams_name ON public.teams USING btree (name);


--
-- Name: players players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hockey_app
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO hockey_app;


--
-- PostgreSQL database dump complete
--

\unrestrict OJh69pWIENzaEZRcnD7EG1bLCMpk8aJkZFk8FCifSQ1mbPaDl1ZJ8qFABLwMiqN

