//palestra/page.tsx
"use client";
import React, { useState, useEffect } from "react";

type Palestra = {
	id: number;
	tema: string;
	data: string;
	horario: string;
	local: string;
	palestrante: string;
	palestranteEmail: string;
};

const userProfiles = {
	administrador: {
		name: 'Admin Henry',
		email: 'admin@aaaaaaa.com',
		role: 'administrador',
	},
	organizador: {
		name: 'Organizador ???',
		email: 'organizador@gmail.com',
		role: 'organizador',
	},
	palestrante: {
		name: 'Palestrante Maria',
		email: 'palestrante@gmail.com',
		role: 'palestrante',
	},
	participante: {
		name: 'Participante Joao',
		email: 'participante@gmail.com',
		role: 'participante',
	},
};

type UserRole = keyof typeof userProfiles;

export default function Page() {
	const [currentUserRole, setCurrentUserRole] = useState<UserRole>('administrador');
	const { name: usuarioNome, email: usuarioEmail, role: papel } = userProfiles[currentUserRole];

	const [palestras, setPalestras] = useState<Palestra[]>([]);
	const [inscricoes, setInscricoes] = useState<{ palestraId: number; participante: string; email: string }[]>([]);
	const [mensagem, setMensagem] = useState("");
	const [form, setForm] = useState<Omit<Palestra, "id" | "palestranteEmail">>({
		tema: "",
		data: "",
		horario: "",
		local: "",
		palestrante: usuarioNome || "",
	});
	const [editId, setEditId] = useState<number | null>(null);
	useEffect(() => {
		if (papel === 'palestrante' || papel === 'administrador' || papel === 'organizador') {
			setForm(prevForm => ({ ...prevForm, palestrante: usuarioNome }));
		}
	}, [usuarioNome, papel]);


	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!usuarioNome || !usuarioEmail) return;
		if (editId !== null) {
			setPalestras(palestras.map(p => p.id === editId ? { ...form, id: editId, palestranteEmail: usuarioEmail } : p));
			setEditId(null);
		} else {
			setPalestras([...palestras, { ...form, id: Date.now(), palestranteEmail: usuarioEmail }]);
		}
		setForm({ tema: "", data: "", horario: "", local: "", palestrante: usuarioNome });
	}

	function handleEdit(id: number) {
		const palestra = palestras.find(p => p.id === id);
		if (palestra) {
			setForm({ tema: palestra.tema, data: palestra.data, horario: palestra.horario, local: palestra.local, palestrante: palestra.palestrante });
			setEditId(id);
		}
	}

	function handleDelete(id: number) {
		setPalestras(palestras.filter(p => p.id !== id));
		if (editId === id) {
			setEditId(null);
			setForm({ tema: "", data: "", horario: "", local: "", palestrante: usuarioNome });
		}
	}

	const podeEditar = papel === "organizador" || papel === "palestrante" || papel === "administrador";

	return (
		<div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
			<div className="mb-8 p-4 bg-gray-50 rounded-lg border">
				<label htmlFor="role-select" className="block text-sm font-medium text-gray-800 mb-2">
					Simular login como:
				</label>
				<select
					id="role-select"
					value={currentUserRole}
					onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
					className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="administrador">Administrador</option>
					<option value="organizador">Organizador</option>
					<option value="palestrante">Palestrante</option>
					<option value="participante">Participante</option>
				</select>
				<p className="text-xs text-gray-600 mt-2">
					Logado como: <span className="font-semibold text-gray-900">{usuarioNome} ({usuarioEmail})</span>
				</p>
			</div>

			<h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Gerenciar Palestras</h2>
			{podeEditar ? (
				<form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-4">
					<input name="tema" value={form.tema} onChange={handleChange} required placeholder="Tema" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
					<input name="data" value={form.data} onChange={handleChange} required placeholder="Data" type="date" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
					<input name="horario" value={form.horario} onChange={handleChange} required placeholder="Horário" type="time" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
					<input name="local" value={form.local} onChange={handleChange} required placeholder="Local" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
					<input name="palestrante" value={form.palestrante} onChange={handleChange} required placeholder="Palestrante responsável" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
					<button type="submit" className="py-2 px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors duration-300">{editId ? "Salvar edição" : "Adicionar palestra"}</button>
				</form>
			) : (
				<p className="mb-8 text-center text-gray-500">Apenas organizadores, palestrantes ou administradores podem criar ou editar palestras.</p>
			)}

			<h3 className="text-xl font-bold mb-4 text-blue-700 text-center">Palestras Agendadas</h3>
			<ul className="divide-y divide-gray-200">
				{palestras.length === 0 && <li className="py-4 text-center text-gray-500">Nenhuma palestra cadastrada.</li>}
				{palestras.map(p => {
					const emailSeguro = usuarioEmail ?? "";
					const inscrito = inscricoes.some(i => i.palestraId === p.id && i.email === emailSeguro);

					return (
						<li key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<div>
								<span className="font-semibold text-blue-700">{p.tema}</span> <br />
								<span className="text-sm text-gray-600">{p.data} às {p.horario} | {p.local}</span> <br />
								<span className="text-sm text-gray-600">Palestrante: {p.palestrante} ({p.palestranteEmail})</span>
							</div>
							<div className="flex gap-2 mt-2 sm:mt-0">
								{podeEditar && (p.palestranteEmail === usuarioEmail || papel === "organizador" || papel === "administrador") && (
									<>
										<button onClick={() => handleEdit(p.id)} className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition-colors duration-300">Editar</button>
										<button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300">Excluir</button>
									</>
								)}
								{papel === "participante" && !inscrito && (
									<button
										onClick={() => {
											setInscricoes([...inscricoes, { palestraId: p.id, participante: usuarioNome, email: emailSeguro }]);
											setMensagem(`Inscrição realizada para "${p.tema}"! Um e-mail de confirmação foi enviado para ${emailSeguro}. Você receberá lembretes antes do evento.`);
										}}
										className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300"
									>Inscrever-se</button>
								)}
								{papel === "participante" && inscrito && (
									<span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">Inscrito</span>
								)}
							</div>
						</li>
					);
				})}
			</ul>
			{mensagem && <p className="text-green-600 mt-6 text-center font-semibold">{mensagem}</p>}
		</div>
	);
}
