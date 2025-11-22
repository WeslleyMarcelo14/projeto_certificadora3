import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';

// GET - Buscar todos os usuários
export async function GET() {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar ou atualizar usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, role, image } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'ID e email são obrigatórios' }, { status: 400 });
    }

    const userRef = doc(db, "users", id);
    const userData = {
      name: name || '',
      email,
      role: role || 'participante',
      image: image || '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await setDoc(userRef, userData, { merge: true });

    return NextResponse.json({ message: 'Usuário salvo com sucesso', user: userData });
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar o cargo do usuário
export async function PUT(request: NextRequest) {
  try {
    // Verifica se o usuário tem permissão
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId e role são obrigatórios' }, { status: 400 });
    }

    const validRoles = ['participante', 'palestrante', 'organizador', 'administrador'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 400 });
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { 
      role,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ message: 'Role atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);

    return NextResponse.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}